-- Alongsyd — semantic search add-on (pgvector).
-- Run this ONCE in the Supabase SQL editor, after schema.sql. Safe to re-run.
--
-- Adds vector embeddings to questions so search can match by MEANING, not just
-- keywords. Embeddings are generated app-side (OpenAI text-embedding-3-small,
-- 1536 dims) on post + by the `pnpm embed` backfill. This is search
-- infrastructure — answers are still written by humans (no AI-generated answers).

create extension if not exists vector;

-- 1536-dim vector for text-embedding-3-small. Nullable: a question is still
-- searchable via keyword FTS before its embedding is filled in.
alter table public.questions add column if not exists embedding vector(1536);

-- HNSW index for fast cosine similarity (good for small/medium pilot corpora,
-- no training step unlike IVFFlat).
create index if not exists questions_embedding_idx
  on public.questions using hnsw (embedding vector_cosine_ops);

-- Semantic match: returns live questions ordered by cosine similarity to the
-- query embedding, above a threshold. Mirrors search_qa's shape (bare question
-- rows) so the app can merge the two result sets.
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
