-- Admin-managed volunteer signup events with multiple shifts per event.
-- Generic version of the hardcoded Heritage Festival 2026 signup sheet.
--
-- Reads + writes all go through the server-side service-role admin client
-- (no public RLS access), so the public site's server actions are responsible
-- for enforcing the `published` and `signups_open` gates before inserting a
-- signup. This mirrors the `chicken_orders` pattern (`using (false)`).

create table if not exists public.volunteer_events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  published boolean not null default false,
  signups_open boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.volunteer_shifts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.volunteer_events on delete cascade,
  shift_date date not null,
  shift_label text check (
    shift_label is null or char_length(btrim(shift_label)) between 1 and 80
  ),
  time_label text check (
    time_label is null or char_length(btrim(time_label)) between 1 and 80
  ),
  notes text check (notes is null or char_length(notes) <= 500),
  sort_order int not null default 0,
  max_signups int check (max_signups is null or max_signups > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.volunteer_signups (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null references public.volunteer_shifts on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  created_at timestamptz not null default now()
);

create index if not exists volunteer_shifts_event_id_idx
  on public.volunteer_shifts (event_id);

create index if not exists volunteer_shifts_event_id_sort_order_idx
  on public.volunteer_shifts (event_id, sort_order, shift_date, created_at);

create index if not exists volunteer_signups_shift_id_idx
  on public.volunteer_signups (shift_id, created_at);

alter table public.volunteer_events enable row level security;
alter table public.volunteer_shifts enable row level security;
alter table public.volunteer_signups enable row level security;

drop policy if exists "volunteer_events_no_direct_access" on public.volunteer_events;
create policy "volunteer_events_no_direct_access"
  on public.volunteer_events
  for select using (false);

drop policy if exists "volunteer_shifts_no_direct_access" on public.volunteer_shifts;
create policy "volunteer_shifts_no_direct_access"
  on public.volunteer_shifts
  for select using (false);

drop policy if exists "volunteer_signups_no_direct_access" on public.volunteer_signups;
create policy "volunteer_signups_no_direct_access"
  on public.volunteer_signups
  for select using (false);

-- No anon/authenticated grants — all access goes through the service-role
-- admin client in server actions and server components.
