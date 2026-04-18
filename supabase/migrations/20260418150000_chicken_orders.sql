-- Chicken cook events and orders. Orders are inserted only after payment (via API with service role).

create table if not exists public.fundraiser_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  event_date date,
  pickup_location text,
  pickup_notes text,
  price_cents_per_unit int not null check (price_cents_per_unit > 0),
  max_units_per_order int not null default 20 check (max_units_per_order > 0),
  inventory_units int,
  order_open boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chicken_orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.fundraiser_events on delete restrict,
  quantity int not null check (quantity > 0),
  unit_price_cents int not null,
  total_cents int not null,
  customer_name text,
  customer_email text not null,
  customer_phone text,
  notes text,
  user_id uuid references auth.users on delete set null,
  status text not null default 'paid' check (
    status in (
      'pending_payment',
      'paid',
      'confirmed',
      'ready',
      'completed',
      'cancelled'
    )
  ),
  stripe_checkout_session_id text unique,
  created_at timestamptz not null default now()
);

create index if not exists chicken_orders_event_id_idx on public.chicken_orders (event_id);
create index if not exists chicken_orders_stripe_session_idx on public.chicken_orders (stripe_checkout_session_id);

alter table public.fundraiser_events enable row level security;
alter table public.chicken_orders enable row level security;

drop policy if exists "fundraiser_events_public_read" on public.fundraiser_events;
create policy "fundraiser_events_public_read" on public.fundraiser_events
  for select using (order_open = true);

drop policy if exists "chicken_orders_no_direct_access" on public.chicken_orders;
create policy "chicken_orders_no_direct_access" on public.chicken_orders
  for select using (false);

grant select on public.fundraiser_events to anon, authenticated;
-- chicken_orders: no anon/authenticated direct access (insert via service role in API only)

insert into public.fundraiser_events (
  title,
  slug,
  description,
  event_date,
  pickup_location,
  pickup_notes,
  price_cents_per_unit,
  max_units_per_order,
  inventory_units,
  order_open
)
select
  'Spring chicken cook',
  'spring-chicken-cook',
  'Community fundraiser — details and final pricing are set by the chapter.',
  (current_date + interval '30 days')::date,
  'Lewisport Lions Club Community Center, 15 Pell Street, Lewisport, KY 42351',
  'Pay at pickup unless you pay online here. Bring confirmation email.',
  1300,
  20,
  200,
  true
where not exists (select 1 from public.fundraiser_events limit 1);
