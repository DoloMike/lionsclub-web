-- Admin-managed photos shown on the public site, organized by named "section"
-- (e.g. `fundraising-banner`). Section keys are owned by the codebase
-- (`src/lib/photo-sections.ts`) — the DB just stores the key as free text so a
-- single CREATE/ALTER doesn't have to know the canonical list.
--
-- Reads + writes all go through the server-side service-role admin client
-- (no public RLS access). The Storage bucket is public so the generated
-- `/storage/v1/object/public/site-photos/<path>` URLs can be loaded directly
-- by browsers without per-request signing.

create table if not exists public.site_photos (
  id uuid primary key default gen_random_uuid(),
  section text not null check (char_length(btrim(section)) between 1 and 60),
  storage_path text not null unique,
  alt_text text not null check (char_length(btrim(alt_text)) between 1 and 200),
  caption text check (caption is null or char_length(caption) <= 280),
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_photos_section_sort_idx
  on public.site_photos (section, sort_order, created_at);

alter table public.site_photos enable row level security;

drop policy if exists "site_photos_no_direct_access" on public.site_photos;
create policy "site_photos_no_direct_access"
  on public.site_photos
  for select using (false);

-- Public read bucket so generated public URLs load in the browser.
-- Server-only writes go through the service-role admin client and bypass RLS.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-photos',
  'site-photos',
  true,
  10485760, -- 10 MiB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
