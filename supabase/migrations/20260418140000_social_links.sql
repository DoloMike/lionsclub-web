-- Editable footer social links (admin-managed).

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  icon_key text not null default 'link' check (
    icon_key in (
      'facebook',
      'instagram',
      'youtube',
      'x',
      'linkedin',
      'blog',
      'link'
    )
  ),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.social_links enable row level security;

drop policy if exists "social_links_read" on public.social_links;
create policy "social_links_read" on public.social_links for select using (true);

grant select on public.social_links to anon, authenticated;

insert into public.social_links (label, url, icon_key, sort_order)
select *
from (
  values
    ('Facebook', 'https://www.facebook.com/lionsclubs', 'facebook', 1),
    ('Instagram', 'https://www.instagram.com/lionsclubs', 'instagram', 2),
    ('YouTube', 'https://www.youtube.com/user/lionsclubsorg', 'youtube', 3),
    ('X', 'https://twitter.com/lionsclubs', 'x', 4),
    ('LinkedIn', 'https://www.linkedin.com/company/lions-clubs-international/', 'linkedin', 5),
    ('LCI blog', 'https://www.lionsclubs.org/en/blog', 'blog', 6)
) as v (label, url, icon_key, sort_order)
where not exists (select 1 from public.social_links limit 1);
