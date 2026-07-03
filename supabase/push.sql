-- Alongsyd — Web Push subscriptions.
-- Run once in the Supabase SQL editor (also folded into schema.sql). Safe to re-run.
--
-- Stores each device's push subscription so we can notify a parent when their
-- question gets answered. One row per device/endpoint; a user may have several.

create table if not exists public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  endpoint     text not null unique,       -- the browser push endpoint (dedupe key)
  subscription jsonb not null,             -- full PushSubscription (keys, endpoint)
  created_at   timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- A parent manages only their own device subscriptions. Sending is done
-- server-side with the service role, which bypasses RLS.
drop policy if exists push_select on public.push_subscriptions;
create policy push_select on public.push_subscriptions
  for select using (auth.uid() = user_id);
drop policy if exists push_insert on public.push_subscriptions;
create policy push_insert on public.push_subscriptions
  for insert with check (auth.uid() = user_id);
drop policy if exists push_update on public.push_subscriptions;
create policy push_update on public.push_subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists push_delete on public.push_subscriptions;
create policy push_delete on public.push_subscriptions
  for delete using (auth.uid() = user_id);
