create table if not exists public.heritage_festival_signups (
  id uuid primary key default gen_random_uuid(),
  signup_date date not null check (
    signup_date in ('2026-05-28', '2026-05-29', '2026-05-30')
  ),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  created_at timestamptz not null default now()
);

alter table public.heritage_festival_signups enable row level security;

drop policy if exists "heritage_festival_signups_read" on public.heritage_festival_signups;
create policy "heritage_festival_signups_read"
  on public.heritage_festival_signups
  for select
  using (true);

grant select on public.heritage_festival_signups to anon, authenticated;
