-- Align indexes with how the app queries them.
--
-- Background:
--  * The previous "paid orders by email" index was on `lower(customer_email)`,
--    but the runtime query is `customer_email.eq.<lowercased value>` — Postgres
--    won't use a functional index unless the WHERE clause matches the function
--    signature exactly. Every write path lowercases on insert (checkout route +
--    Stripe webhook + return-page fallback), so a plain partial index on
--    `customer_email` is correct and gets used.
--
--  * The public banner / order pages query `fundraiser_events` filtered by
--    `order_open = true` and `event_date > today`. A small partial index keeps
--    the planner from scanning the whole table.

-- Replace the unused functional index with a plain one.
drop index if exists public.chicken_orders_email_paid_idx;

create index if not exists chicken_orders_email_paid_idx
  on public.chicken_orders (customer_email)
  where status = 'paid';

-- Public listing of "currently orderable" events.
create index if not exists fundraiser_events_open_event_date_idx
  on public.fundraiser_events (event_date)
  where order_open = true;
