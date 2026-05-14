-- Bind every volunteer signup to a Supabase auth user so the only people
-- who can sign up are signed-in users (name pulled from their Google profile).
--
-- The column is added as nullable so the migration is safe to apply over a
-- pre-existing table that may already have rows from local dev. New rows are
-- always inserted with `user_id` (enforced in the server action). Existing
-- nameless / userless rows can be deleted manually from the admin UI.
--
-- The partial unique index prevents the same user from claiming a shift twice
-- while still allowing legacy NULL-`user_id` rows to coexist.

alter table public.volunteer_signups
  add column if not exists user_id uuid references auth.users on delete set null;

create index if not exists volunteer_signups_user_id_idx
  on public.volunteer_signups (user_id);

create unique index if not exists volunteer_signups_shift_user_unique_idx
  on public.volunteer_signups (shift_id, user_id)
  where user_id is not null;
