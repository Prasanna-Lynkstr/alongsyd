-- Alongsyd — Wave 2 schema: saved items, document checklists, question follows,
-- and a persisted in-app notification inbox.
--
-- Run this once in the Supabase SQL editor (after schema.sql). Safe to re-run.
-- Until it's applied, the app degrades gracefully: every read/write against
-- these tables is best-effort in the app layer, so nothing 500s.

-- ===========================================================================
-- saved_schemes — a parent's bookmarked schemes ("my schemes to claim").
-- ===========================================================================
create table if not exists public.saved_schemes (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  scheme_id  text not null,                -- matches an id in config/schemes.json
  created_at timestamptz not null default now(),
  primary key (user_id, scheme_id)
);
alter table public.saved_schemes enable row level security;
drop policy if exists saved_schemes_all on public.saved_schemes;
create policy saved_schemes_all on public.saved_schemes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===========================================================================
-- scheme_doc_checks — which document items a parent has ticked off, per scheme.
-- Presence of a row = that document (by its index in scheme.documents) is done.
-- ===========================================================================
create table if not exists public.scheme_doc_checks (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  scheme_id  text not null,
  doc_index  int  not null,
  created_at timestamptz not null default now(),
  primary key (user_id, scheme_id, doc_index)
);
alter table public.scheme_doc_checks enable row level security;
drop policy if exists scheme_doc_checks_all on public.scheme_doc_checks;
create policy scheme_doc_checks_all on public.scheme_doc_checks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===========================================================================
-- saved_questions — bookmarked questions.
-- ===========================================================================
create table if not exists public.saved_questions (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, question_id)
);
alter table public.saved_questions enable row level security;
drop policy if exists saved_questions_all on public.saved_questions;
create policy saved_questions_all on public.saved_questions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===========================================================================
-- question_follows — subscribe to a question's new answers.
-- ===========================================================================
create table if not exists public.question_follows (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, question_id)
);
create index if not exists question_follows_q_idx
  on public.question_follows (question_id);
alter table public.question_follows enable row level security;
drop policy if exists question_follows_all on public.question_follows;
create policy question_follows_all on public.question_follows
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===========================================================================
-- notifications — persisted in-app inbox. Web Push is fire-and-forget; this is
-- the record a parent can come back to. Rows are written server-side with the
-- service-role key (bypasses RLS); users may only read/update their own.
-- ===========================================================================
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  kind       text not null,                -- 'answer' | 'helpful' | 'digest' | 'reminder'
  title      text not null,
  body       text not null default '',
  url        text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);
alter table public.notifications enable row level security;
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select using (auth.uid() = user_id);
drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
