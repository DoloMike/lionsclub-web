-- Last calendar day to submit orders (inclusive). Pickup remains event_date.

alter table public.fundraiser_events add column if not exists orders_close_date date;

update public.fundraiser_events
set orders_close_date = (event_date - interval '10 days')::date
where orders_close_date is null and event_date is not null;

update public.fundraiser_events
set orders_close_date = coalesce(event_date, (current_date + interval '30 days')::date)
where orders_close_date is null;

alter table public.fundraiser_events alter column orders_close_date set not null;

alter table public.fundraiser_events drop constraint if exists fundraiser_orders_before_pickup;

alter table public.fundraiser_events
  add constraint fundraiser_orders_before_pickup check (
    event_date is null or orders_close_date <= event_date
  );
