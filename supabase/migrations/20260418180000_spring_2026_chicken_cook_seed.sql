-- Precise order deadline and pickup start (Central). When set, app uses these instead of date-only.

alter table public.fundraiser_events add column if not exists orders_close_at timestamptz;
alter table public.fundraiser_events add column if not exists pickup_starts_at timestamptz;

-- Existing rows: end-of-day Central for deadline; noon Central for pickup start (until edited in admin).
update public.fundraiser_events
set orders_close_at = (
  (orders_close_date::text || ' 23:59:59')::timestamp at time zone 'America/Chicago'
)
where orders_close_at is null and orders_close_date is not null;

update public.fundraiser_events
set pickup_starts_at = (
  (event_date::text || ' 12:00:00')::timestamp at time zone 'America/Chicago'
)
where pickup_starts_at is null and event_date is not null;

-- First official chicken cook seed: orders due Mon Apr 20, 2026 12:00 PM Central; pickup Sat Apr 25, 2026 12:00 PM Central.
update public.fundraiser_events
set
  title = 'Spring 2026 chicken cook',
  slug = 'spring-2026-chicken-cook',
  description = 'Lewisport Lions chicken cook fundraiser. Order online or contact the chapter for help.',
  event_date = '2026-04-25',
  orders_close_date = '2026-04-20',
  orders_close_at = '2026-04-20 12:00:00'::timestamp at time zone 'America/Chicago',
  pickup_starts_at = '2026-04-25 12:00:00'::timestamp at time zone 'America/Chicago',
  pickup_location = 'Lewisport Community Center',
  pickup_notes = 'Chickens available for pickup starting at 12:00 PM Central. Bring your confirmation email.',
  price_cents_per_unit = 1300,
  max_units_per_order = 20,
  inventory_units = 200,
  order_open = true,
  updated_at = now()
where slug = 'spring-chicken-cook';

insert into public.fundraiser_events (
  title,
  slug,
  description,
  event_date,
  orders_close_date,
  orders_close_at,
  pickup_starts_at,
  pickup_location,
  pickup_notes,
  price_cents_per_unit,
  max_units_per_order,
  inventory_units,
  order_open
)
select
  'Spring 2026 chicken cook',
  'spring-2026-chicken-cook',
  'Lewisport Lions chicken cook fundraiser. Order online or contact the chapter for help.',
  '2026-04-25',
  '2026-04-20',
  '2026-04-20 12:00:00'::timestamp at time zone 'America/Chicago',
  '2026-04-25 12:00:00'::timestamp at time zone 'America/Chicago',
  'Lewisport Community Center',
  'Chickens available for pickup starting at 12:00 PM Central. Bring your confirmation email.',
  1300,
  20,
  200,
  true
where not exists (
  select 1 from public.fundraiser_events where slug = 'spring-2026-chicken-cook'
);
