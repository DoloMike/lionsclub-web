-- Inventory race guard for chicken_orders.
--
-- Background:
--  * `api/checkout/chicken/route.ts` does:
--        sold = rpc(chicken_event_sold)
--        if sold + qty <= inventory_units: stripe.checkout.sessions.create(...)
--    and the actual INSERT happens later (Stripe webhook or return-page
--    fallback). Two near-simultaneous orders can both pass the app-level
--    check and both end up inserted, over-selling the event.
--  * The right place to enforce inventory invariants is the database, where
--    we can serialize against concurrent writers with a row lock.
--
-- Mechanism:
--  * BEFORE INSERT OR UPDATE trigger on chicken_orders.
--  * Locks the parent fundraiser_events row with SELECT ... FOR UPDATE so
--    concurrent inserts for the same event serialize cleanly (other events
--    are unaffected).
--  * Sums existing non-cancelled orders for the event (excluding the row
--    being updated, on UPDATE) and rejects if (sold + new_counted) exceeds
--    inventory_units. Uncapped events (inventory_units IS NULL) are skipped.
--  * Cancelled rows don't count toward inventory; UPDATEs that flip a row
--    INTO cancelled free capacity, UPDATEs OUT of cancelled re-consume it.
--  * event_id is treated as immutable to keep the accounting honest.
--
-- App code keeps its pre-checkout check (it's needed to fail fast before
-- redirecting the buyer to Stripe with a doomed session). This trigger is
-- the durable invariant that survives concurrent writers.

create or replace function public.chicken_orders_inventory_guard()
returns trigger
language plpgsql
as $$
declare
  v_inventory   int;
  v_other_sold  int;
  v_new_counted int;
begin
  if (tg_op = 'UPDATE') then
    if (old.event_id is distinct from new.event_id) then
      raise exception
        'chicken_orders.event_id is immutable (old=%, new=%)',
        old.event_id, new.event_id
        using errcode = 'check_violation';
    end if;
  end if;

  v_new_counted := case when new.status = 'cancelled' then 0 else new.quantity end;

  if v_new_counted = 0 then
    return new;
  end if;

  -- Lock the parent event row so concurrent INSERTs for the same event
  -- serialize on the inventory check. Different events are independent.
  select inventory_units
    into v_inventory
  from public.fundraiser_events
  where id = new.event_id
  for update;

  if v_inventory is null then
    return new;
  end if;

  select coalesce(sum(quantity), 0)::int
    into v_other_sold
  from public.chicken_orders
  where event_id = new.event_id
    and status <> 'cancelled'
    and (tg_op = 'INSERT' or id <> new.id);

  if v_other_sold + v_new_counted > v_inventory then
    raise exception
      'Inventory exceeded for fundraiser % (requested=%, already_sold=%, capacity=%)',
      new.event_id, new.quantity, v_other_sold, v_inventory
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists chicken_orders_inventory_guard_trg on public.chicken_orders;
create trigger chicken_orders_inventory_guard_trg
  before insert or update on public.chicken_orders
  for each row execute function public.chicken_orders_inventory_guard();
