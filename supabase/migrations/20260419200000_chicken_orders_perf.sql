-- Single-query paid lookups + fast inventory checks for checkout.

create index if not exists chicken_orders_user_paid_idx
  on public.chicken_orders (user_id)
  where status = 'paid';

create index if not exists chicken_orders_email_paid_idx
  on public.chicken_orders (lower(customer_email))
  where status = 'paid';

create index if not exists chicken_orders_event_noncancelled_idx
  on public.chicken_orders (event_id)
  where status <> 'cancelled';

create or replace function public.chicken_event_sold(p_event_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(quantity), 0)::int
  from chicken_orders
  where event_id = p_event_id and status <> 'cancelled'
$$;

grant execute on function public.chicken_event_sold(uuid) to service_role;
