alter table public.heritage_festival_signups
  drop constraint if exists heritage_festival_signups_signup_date_check;

alter table public.heritage_festival_signups
  add constraint heritage_festival_signups_signup_date_check
  check (
    signup_date in (
      '2026-05-26',
      '2026-05-28',
      '2026-05-29',
      '2026-05-30',
      '2026-05-31'
    )
  );
