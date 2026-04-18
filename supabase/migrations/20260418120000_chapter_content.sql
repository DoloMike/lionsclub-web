-- Public chapter content + profiles for admin auth.
-- Run via Supabase SQL editor or `supabase db push` after linking the project.

create table if not exists public.site_settings (
  id int primary key check (id = 1),
  meeting_schedule text not null default 'Contact us for the current meeting day, time, and any holiday changes.',
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id, meeting_schedule)
values (1, 'Contact us for the current meeting day, time, and any holiday changes.')
on conflict (id) do nothing;

create table if not exists public.officers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.chapter_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.officers enable row level security;
alter table public.chapter_events enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "site_settings_read" on public.site_settings;
create policy "site_settings_read" on public.site_settings for select using (true);

drop policy if exists "officers_read" on public.officers;
create policy "officers_read" on public.officers for select using (true);

drop policy if exists "chapter_events_read" on public.chapter_events;
create policy "chapter_events_read" on public.chapter_events for select using (true);

drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own" on public.profiles for select using (auth.uid() = id);

grant usage on schema public to anon, authenticated;
grant select on public.site_settings, public.officers, public.chapter_events to anon, authenticated;
grant select on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'member');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
