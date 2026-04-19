-- Normalize chicken_orders contact fields at the database layer.
--
-- Background:
--  * App code already lowercases `customer_email` on every write path
--    (checkout route, Stripe webhook, return-page fallback). Pushing the
--    invariant into Postgres means future write paths (admin tools, manual
--    SQL fixes, future RPCs) can't accidentally store mixed-case or padded
--    values that would silently break the partial index in
--    `chicken_orders_email_paid_idx` (which is on plain `customer_email`).
--  * Trim/empty-to-null on name + phone keeps the "find my orders" lookups
--    and admin tables tidy without scattering normalization in app code.
--  * A loose email-shape CHECK catches obvious garbage early without
--    pretending to be a full RFC validator (Stripe + the email provider
--    remain the source of truth for deliverability).

create or replace function public.chicken_orders_normalize()
returns trigger
language plpgsql
as $$
begin
  if new.customer_email is not null then
    new.customer_email := lower(btrim(new.customer_email));
  end if;
  new.customer_name  := nullif(btrim(new.customer_name),  '');
  new.customer_phone := nullif(btrim(new.customer_phone), '');
  return new;
end;
$$;

drop trigger if exists chicken_orders_normalize_trg on public.chicken_orders;
create trigger chicken_orders_normalize_trg
  before insert or update on public.chicken_orders
  for each row execute function public.chicken_orders_normalize();

-- Backfill anything that pre-dates the trigger so the CHECK constraints
-- below can be added without a separate validation pass.
update public.chicken_orders
set
  customer_email = lower(btrim(customer_email)),
  customer_name  = nullif(btrim(customer_name),  ''),
  customer_phone = nullif(btrim(customer_phone), '')
where
  customer_email <> lower(btrim(customer_email))
  or customer_name  is distinct from nullif(btrim(customer_name),  '')
  or customer_phone is distinct from nullif(btrim(customer_phone), '');

alter table public.chicken_orders
  drop constraint if exists chicken_orders_email_lower_chk;

alter table public.chicken_orders
  add constraint chicken_orders_email_lower_chk
  check (customer_email = lower(customer_email));

alter table public.chicken_orders
  drop constraint if exists chicken_orders_email_shape_chk;

-- Intentionally simple: one '@', a dot in the domain, no whitespace,
-- bounded length. Real validation happens at Stripe / the inbox.
alter table public.chicken_orders
  add constraint chicken_orders_email_shape_chk
  check (
    char_length(customer_email) between 3 and 254
    and customer_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  );
