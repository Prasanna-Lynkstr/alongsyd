-- Alongsyd — database schema for the Supabase Postgres pilot.
-- Run this once in the Supabase SQL editor (or `supabase db push`).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE and drops policies first.
--
-- Design notes:
--  * We NEVER store a child's name. There is no column for it, anywhere.
--  * Phone numbers live only in auth.users (managed by Supabase Auth) and are
--    never copied into public tables, so they can't leak to other users.
--  * Moderation (verify user / remove content) is done server-side with the
--    service-role key; the triggers below stop users escalating their own privs.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- ===========================================================================
-- profiles — a parent's safe second identity (alias + avatar). 1:1 with auth.
-- ===========================================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  alias         text not null default '',
  avatar        text not null default '🙂',
  condition     text,               -- child's condition tag (NOT a name)
  child_age     int,                -- child's age in years (NOT a name)
  city          text,
  state         text,               -- 2-letter code from taxonomy
  is_verified   boolean not null default false,   -- expert/veteran badge
  is_admin      boolean not null default false,
  consented_at  timestamptz,        -- set when the consent screen is accepted
  onboarded_at  timestamptz,        -- set when the one-time welcome is seen
  created_at    timestamptz not null default now()
);

-- Block users from making themselves verified/admin. Only the service role
-- (used by our server-side moderation routes) may change these flags.
create or replace function public.guard_profile_privileges()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.role() <> 'service_role' then
    if new.is_verified is distinct from old.is_verified
       or new.is_admin is distinct from old.is_admin then
      raise exception 'Not allowed to change verification/admin flags';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_profile_privileges on public.profiles;
create trigger trg_guard_profile_privileges
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();

-- helper: is the current caller an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ===========================================================================
-- questions
-- ===========================================================================
create table if not exists public.questions (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid references public.profiles(id) on delete set null,
  title        text not null,
  body         text not null default '',
  condition    text,
  age_band     text,
  city         text,
  state        text,
  topic        text,
  answer_count int not null default 0,
  is_removed   boolean not null default false,
  created_at   timestamptz not null default now(),
  -- full-text search vector over title + body
  search_tsv   tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'B')
  ) stored
);
create index if not exists questions_created_idx on public.questions (created_at desc);
create index if not exists questions_condition_idx on public.questions (condition);
create index if not exists questions_topic_idx on public.questions (topic);
create index if not exists questions_tsv_idx on public.questions using gin (search_tsv);

-- ===========================================================================
-- answers
-- ===========================================================================
create table if not exists public.answers (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references public.questions(id) on delete cascade,
  author_id    uuid references public.profiles(id) on delete set null,
  body         text not null,
  helped_count int not null default 0,
  is_removed   boolean not null default false,
  created_at   timestamptz not null default now(),
  search_tsv   tsvector generated always as (
    to_tsvector('english', coalesce(body, ''))
  ) stored
);
create index if not exists answers_question_idx on public.answers (question_id);
create index if not exists answers_tsv_idx on public.answers using gin (search_tsv);

-- keep questions.answer_count in sync with live (non-removed) answers
create or replace function public.sync_answer_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare qid uuid;
begin
  qid := coalesce(new.question_id, old.question_id);
  update public.questions q
     set answer_count = (
       select count(*) from public.answers a
        where a.question_id = qid and a.is_removed = false
     )
   where q.id = qid;
  return null;
end;
$$;
drop trigger if exists trg_sync_answer_count on public.answers;
create trigger trg_sync_answer_count
  after insert or update or delete on public.answers
  for each row execute function public.sync_answer_count();

-- ===========================================================================
-- helpful_votes — one "this helped" per (answer, user). Drives helped_count.
-- ===========================================================================
create table if not exists public.helpful_votes (
  answer_id  uuid not null references public.answers(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (answer_id, user_id)
);

create or replace function public.sync_helped_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare aid uuid;
begin
  aid := coalesce(new.answer_id, old.answer_id);
  update public.answers a
     set helped_count = (
       select count(*) from public.helpful_votes v where v.answer_id = aid
     )
   where a.id = aid;
  return null;
end;
$$;
drop trigger if exists trg_sync_helped_count on public.helpful_votes;
create trigger trg_sync_helped_count
  after insert or delete on public.helpful_votes
  for each row execute function public.sync_helped_count();

-- ===========================================================================
-- scheme_notes — crowd experience attached to a baseline scheme id.
-- Author display fields are denormalised so the PUBLIC (no-login) scheme page
-- can render them without reading the profiles table.
-- ===========================================================================
create table if not exists public.scheme_notes (
  id             uuid primary key default gen_random_uuid(),
  scheme_id      text not null,          -- matches an id in config/schemes.json
  state          text,
  district       text,
  author_id      uuid references public.profiles(id) on delete set null,
  author_alias   text not null default 'A parent',
  author_avatar  text not null default '🙂',
  author_verified boolean not null default false,
  body           text not null,
  is_removed     boolean not null default false,
  created_at     timestamptz not null default now()
);
create index if not exists scheme_notes_scheme_idx on public.scheme_notes (scheme_id);
create index if not exists scheme_notes_state_idx on public.scheme_notes (state);

-- ===========================================================================
-- scheme_flags — "this scheme is missing/wrong for my state" → admin queue.
-- ===========================================================================
create table if not exists public.scheme_flags (
  id          uuid primary key default gen_random_uuid(),
  scheme_id   text,                    -- null if reporting a MISSING scheme
  state       text,
  note        text not null default '',
  reporter_id uuid references public.profiles(id) on delete set null,
  resolved    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ===========================================================================
-- reports — harmful-content reports → admin queue.
-- ===========================================================================
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('question','answer','scheme_note')),
  target_id   uuid not null,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason      text not null default '',
  resolved    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ===========================================================================
-- Full-text search across Q&A. Returns question rows whose question OR any of
-- its answers match the query, ranked. Used by the search box at the top.
-- ===========================================================================
create or replace function public.search_qa(query text)
returns table (
  id uuid, author_id uuid, title text, body text, condition text,
  age_band text, city text, state text, topic text, answer_count int,
  is_removed boolean, created_at timestamptz
)
language sql stable security definer set search_path = public as $$
  with q as (select websearch_to_tsquery('english', query) as tsq)
  select ques.id, ques.author_id, ques.title, ques.body, ques.condition,
         ques.age_band, ques.city, ques.state, ques.topic, ques.answer_count,
         ques.is_removed, ques.created_at
  from public.questions ques, q
  where ques.is_removed = false
    and (
      ques.search_tsv @@ q.tsq
      or exists (
        select 1 from public.answers a
        where a.question_id = ques.id
          and a.is_removed = false
          and a.search_tsv @@ q.tsq
      )
    )
  order by ts_rank(ques.search_tsv, (select tsq from q)) desc,
           ques.created_at desc;
$$;

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.profiles      enable row level security;
alter table public.questions     enable row level security;
alter table public.answers       enable row level security;
alter table public.helpful_votes enable row level security;
alter table public.scheme_notes  enable row level security;
alter table public.scheme_flags  enable row level security;
alter table public.reports       enable row level security;

-- profiles: any signed-in user may read personas; you may write only your own.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (auth.uid() is not null);
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert with check (auth.uid() = id);
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- questions: signed-in users read live (or admins read all); author inserts own.
drop policy if exists questions_select on public.questions;
create policy questions_select on public.questions
  for select using (auth.uid() is not null and (is_removed = false or public.is_admin()));
drop policy if exists questions_insert on public.questions;
create policy questions_insert on public.questions
  for insert with check (auth.uid() = author_id);

-- answers: same shape as questions.
drop policy if exists answers_select on public.answers;
create policy answers_select on public.answers
  for select using (auth.uid() is not null and (is_removed = false or public.is_admin()));
drop policy if exists answers_insert on public.answers;
create policy answers_insert on public.answers
  for insert with check (auth.uid() = author_id);

-- helpful_votes: signed-in users read all (to compute counts / own vote);
-- you may add/remove only your own vote.
drop policy if exists votes_select on public.helpful_votes;
create policy votes_select on public.helpful_votes
  for select using (auth.uid() is not null);
drop policy if exists votes_insert on public.helpful_votes;
create policy votes_insert on public.helpful_votes
  for insert with check (auth.uid() = user_id);
drop policy if exists votes_delete on public.helpful_votes;
create policy votes_delete on public.helpful_votes
  for delete using (auth.uid() = user_id);

-- scheme_notes: PUBLIC read (no-login scheme checker); signed-in users add own.
drop policy if exists scheme_notes_select on public.scheme_notes;
create policy scheme_notes_select on public.scheme_notes
  for select using (is_removed = false);
drop policy if exists scheme_notes_insert on public.scheme_notes;
create policy scheme_notes_insert on public.scheme_notes
  for insert with check (auth.uid() = author_id);

-- scheme_flags: signed-in users file their own; only admins read the queue.
drop policy if exists scheme_flags_insert on public.scheme_flags;
create policy scheme_flags_insert on public.scheme_flags
  for insert with check (auth.uid() = reporter_id);
drop policy if exists scheme_flags_select on public.scheme_flags;
create policy scheme_flags_select on public.scheme_flags
  for select using (public.is_admin());

-- reports: signed-in users file their own; only admins read the queue.
drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports
  for insert with check (auth.uid() = reporter_id);
drop policy if exists reports_select on public.reports;
create policy reports_select on public.reports
  for select using (public.is_admin());

-- Let anon + authenticated call the search + admin-check functions.
grant execute on function public.search_qa(text) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ===========================================================================
-- Semantic search (pgvector). Also available standalone in semantic-search.sql
-- for adding to an already-created database. See that file for notes.
-- ===========================================================================
create extension if not exists vector;
alter table public.questions add column if not exists embedding vector(1536);
create index if not exists questions_embedding_idx
  on public.questions using hnsw (embedding vector_cosine_ops);

create or replace function public.match_questions(
  query_embedding vector(1536),
  match_count int default 20,
  similarity_threshold float default 0.2
)
returns table (
  id uuid, author_id uuid, title text, body text, condition text,
  age_band text, city text, state text, topic text, answer_count int,
  is_removed boolean, created_at timestamptz, similarity float
)
language sql stable security definer set search_path = public as $$
  select q.id, q.author_id, q.title, q.body, q.condition, q.age_band, q.city,
         q.state, q.topic, q.answer_count, q.is_removed, q.created_at,
         1 - (q.embedding <=> query_embedding) as similarity
  from public.questions q
  where q.is_removed = false
    and q.embedding is not null
    and 1 - (q.embedding <=> query_embedding) > similarity_threshold
  order by q.embedding <=> query_embedding
  limit match_count;
$$;
grant execute on function public.match_questions(vector, int, float) to anon, authenticated;

-- ===========================================================================
-- Web Push subscriptions. Also available standalone in push.sql.
-- ===========================================================================
create table if not exists public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  endpoint     text not null unique,
  subscription jsonb not null,
  created_at   timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;
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
