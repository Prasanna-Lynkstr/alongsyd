import "server-only";
import { createClient } from "./supabase/server";
import { embed, isEmbeddingsConfigured } from "./embeddings";
import { rerank, type Candidate } from "./search";
import type { Answer, Question, SchemeNote } from "./types";

type Row = Record<string, unknown>;

function toPublicAuthor(row: Row | null | undefined) {
  if (!row) return null;
  return {
    id: row.id as string,
    alias: (row.alias as string) ?? "A parent",
    avatar: (row.avatar as string) ?? "🙂",
    isVerified: Boolean(row.is_verified),
  };
}

function toQuestion(row: Row): Question {
  return {
    id: row.id as string,
    author: toPublicAuthor(row.author as Row),
    title: row.title as string,
    body: (row.body as string) ?? "",
    condition: (row.condition as string) ?? null,
    ageBand: (row.age_band as string) ?? null,
    city: (row.city as string) ?? null,
    state: (row.state as string) ?? null,
    topic: (row.topic as string) ?? null,
    answerCount: (row.answer_count as number) ?? 0,
    createdAt: (row.created_at as string) ?? "",
    isRemoved: Boolean(row.is_removed),
  };
}

const QUESTION_SELECT =
  "*, author:profiles!questions_author_id_fkey(id,alias,avatar,is_verified)";

export type FeedFilter = {
  condition?: string;
  ageBand?: string;
  topic?: string;
};

/** Feed: newest questions first, optionally filtered by a tag. */
export async function listQuestions(
  filter: FeedFilter = {},
  limit = 50,
): Promise<Question[]> {
  const supabase = await createClient();
  let q = supabase
    .from("questions")
    .select(QUESTION_SELECT)
    .eq("is_removed", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filter.condition) q = q.eq("condition", filter.condition);
  if (filter.ageBand) q = q.eq("age_band", filter.ageBand);
  if (filter.topic) q = q.eq("topic", filter.topic);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(toQuestion);
}

/**
 * Hybrid search across questions + answers.
 *  - SEMANTIC: embed the query, match by meaning via match_questions (pgvector).
 *  - KEYWORD:  stemmed full-text search via search_qa (catches exact terms —
 *    names, scheme acronyms — that meaning-matching can miss).
 * Semantic hits lead (ordered by similarity); keyword-only hits are appended.
 * If embeddings aren't configured, this is exactly the old keyword search.
 */
export async function searchQuestions(query: string): Promise<Question[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const supabase = await createClient();

  // Kick off keyword search immediately (always available).
  const keywordPromise = supabase.rpc("search_qa", { query: trimmed });

  // Collect candidates by id, keeping the best signal we have for each:
  // a vector similarity (semantic) and/or a keyword-hit flag.
  const byId = new Map<string, Candidate>();

  // Semantic search (best-effort): embed the query, then vector-match. Pull a
  // wide net (low threshold, high count) — the reranker does the real filtering.
  if (isEmbeddingsConfigured) {
    const vector = await embed(trimmed);
    if (vector) {
      const { data } = await supabase.rpc("match_questions", {
        query_embedding: vector,
        match_count: 30,
        similarity_threshold: 0.15,
      });
      for (const r of (data ?? []) as Row[]) {
        byId.set(r.id as string, {
          question: toQuestion({ ...r, author: null }),
          similarity: (r.similarity as number) ?? undefined,
          keyword: false,
        });
      }
    }
  }

  const { data: keywordData, error } = await keywordPromise;
  if (error && byId.size === 0) throw error;
  for (const r of (keywordData ?? []) as Row[]) {
    const id = r.id as string;
    const existing = byId.get(id);
    if (existing) existing.keyword = true; // in both → keep similarity, flag keyword
    else
      byId.set(id, {
        question: toQuestion({ ...r, author: null }),
        keyword: true,
      });
  }

  // Rerank by similarity + structured-tag boosts (location, condition, topic).
  return rerank(trimmed, [...byId.values()]);
}

export async function getQuestion(id: string): Promise<Question | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("questions")
    .select(QUESTION_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toQuestion(data) : null;
}

/** Answers for a question, sorted by "this helped" then recency. */
export async function getAnswers(questionId: string): Promise<Answer[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("answers")
    .select(
      "*, author:profiles!answers_author_id_fkey(id,alias,avatar,is_verified)",
    )
    .eq("question_id", questionId)
    .eq("is_removed", false)
    .order("helped_count", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw error;

  const rows = (data ?? []) as Row[];

  // Which of these did the current viewer mark helpful?
  let votedSet = new Set<string>();
  if (user && rows.length) {
    const ids = rows.map((r) => r.id as string);
    const { data: votes } = await supabase
      .from("helpful_votes")
      .select("answer_id")
      .eq("user_id", user.id)
      .in("answer_id", ids);
    votedSet = new Set((votes ?? []).map((v) => v.answer_id as string));
  }

  return rows.map((row) => ({
    id: row.id as string,
    questionId: row.question_id as string,
    author: toPublicAuthor(row.author as Row),
    body: row.body as string,
    helpedCount: (row.helped_count as number) ?? 0,
    viewerFoundHelpful: votedSet.has(row.id as string),
    createdAt: (row.created_at as string) ?? "",
    isRemoved: Boolean(row.is_removed),
  }));
}

/** Crowd notes for a scheme (public read — used by the no-login checker). */
export async function listSchemeNotes(
  schemeId: string,
  state?: string,
): Promise<SchemeNote[]> {
  const supabase = await createClient();
  let q = supabase
    .from("scheme_notes")
    .select("*")
    .eq("scheme_id", schemeId)
    .eq("is_removed", false)
    .order("created_at", { ascending: false });
  if (state) q = q.eq("state", state);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((row: Row) => ({
    id: row.id as string,
    schemeId: row.scheme_id as string,
    state: (row.state as string) ?? null,
    district: (row.district as string) ?? null,
    author: {
      id: (row.author_id as string) ?? "",
      alias: (row.author_alias as string) ?? "A parent",
      avatar: (row.author_avatar as string) ?? "🙂",
      isVerified: Boolean(row.author_verified),
    },
    body: row.body as string,
    createdAt: (row.created_at as string) ?? "",
    isRemoved: Boolean(row.is_removed),
  }));
}

/** Note counts per scheme id, for badges on the scheme list. */
export async function schemeNoteCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scheme_notes")
    .select("scheme_id")
    .eq("is_removed", false);
  if (error) return {};
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const id = (row as Row).scheme_id as string;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}
