-- Chickens are $13.00 each ($13.00 = 1300 cents per unit).
update public.fundraiser_events
set price_cents_per_unit = 1300, updated_at = now()
where slug in ('spring-2026-chicken-cook', 'spring-chicken-cook');
