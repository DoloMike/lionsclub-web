create table if not exists public.hancock_county_fair_signups (
  id uuid primary key default gen_random_uuid(),
  signup_key text not null check (
    signup_key in (
      'fair-gate-thursday',
      'fair-gate-friday',
      'lions-booth-thursday',
      'lions-booth-friday',
      'lions-booth-saturday'
    )
  ),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  created_at timestamptz not null default now()
);

alter table public.hancock_county_fair_signups enable row level security;

drop policy if exists "hancock_county_fair_signups_read" on public.hancock_county_fair_signups;
create policy "hancock_county_fair_signups_read"
  on public.hancock_county_fair_signups
  for select
  using (true);

grant select on public.hancock_county_fair_signups to anon, authenticated;
