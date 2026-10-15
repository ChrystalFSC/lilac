-- Lilac sync: run this once in your Supabase project (SQL Editor → New query → Run).
-- Safe to run again.

-- One row per logged day. entry = null means the day was cleared (so other devices clear it too).
-- stamp = when it last changed on a device (milliseconds), used to keep the newest version.
create table if not exists public.lilac_entries (
  user_id    uuid not null default auth.uid() references auth.users on delete cascade,
  day        date not null,
  entry      jsonb,
  stamp      bigint not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- Row level security: each signed-in account can only see and change its own rows.
alter table public.lilac_entries enable row level security;

drop policy if exists "own entries" on public.lilac_entries;
create policy "own entries" on public.lilac_entries
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.lilac_entries to authenticated;
revoke all on public.lilac_entries from anon;
