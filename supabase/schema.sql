-- LIVINGROOM POKER DATABASE SETUP
-- Run this entire file in Supabase > SQL Editor > New query.
-- Then create an admin user in Authentication > Users and run the
-- INSERT statement at the bottom with that user's UUID.

create extension if not exists pgcrypto;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(trim(display_name)) between 1 and 40),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_scores (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete restrict,
  score_date date not null,
  coins bigint not null check (coins >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(player_id, score_date)
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists daily_scores_date_idx on public.daily_scores(score_date desc);
create index if not exists daily_scores_player_date_idx on public.daily_scores(player_id, score_date desc);

create or replace function public.is_livingroom_poker_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_livingroom_poker_admin() from public;
grant execute on function public.is_livingroom_poker_admin() to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists daily_scores_updated_at on public.daily_scores;
create trigger daily_scores_updated_at
before update on public.daily_scores
for each row execute function public.set_updated_at();

alter table public.players enable row level security;
alter table public.daily_scores enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Public can read active players" on public.players;
create policy "Public can read active players"
on public.players for select
to anon, authenticated
using (active = true or public.is_livingroom_poker_admin());

drop policy if exists "Admins can insert players" on public.players;
create policy "Admins can insert players"
on public.players for insert
to authenticated
with check (public.is_livingroom_poker_admin());

drop policy if exists "Admins can update players" on public.players;
create policy "Admins can update players"
on public.players for update
to authenticated
using (public.is_livingroom_poker_admin())
with check (public.is_livingroom_poker_admin());

drop policy if exists "Public can read daily scores" on public.daily_scores;
create policy "Public can read daily scores"
on public.daily_scores for select
to anon, authenticated
using (true);

drop policy if exists "Admins can insert daily scores" on public.daily_scores;
create policy "Admins can insert daily scores"
on public.daily_scores for insert
to authenticated
with check (public.is_livingroom_poker_admin());

drop policy if exists "Admins can update daily scores" on public.daily_scores;
create policy "Admins can update daily scores"
on public.daily_scores for update
to authenticated
using (public.is_livingroom_poker_admin())
with check (public.is_livingroom_poker_admin());

drop policy if exists "Admins can read admin list" on public.admin_users;
create policy "Admins can read admin list"
on public.admin_users for select
to authenticated
using (public.is_livingroom_poker_admin());

-- IMPORTANT: after creating your admin user in Supabase Auth,
-- replace YOUR_AUTH_USER_UUID below with the user's UUID and run:
-- insert into public.admin_users (user_id)
-- values ('YOUR_AUTH_USER_UUID')
-- on conflict do nothing;
