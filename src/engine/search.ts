/**
 * Query understanding + tag-aware reranking for hybrid search.
 *
 * Semantic similarity alone treats "in Chennai" as weak text, so location and
 * condition constraints get ignored. Here we detect those tags from the query
 * (via the config synonym map + taxonomy labels) and BOOST results whose stored
 * tags match — so a local, on-topic question outranks a semantically-close but
 * off-location one. Boost, not hard-filter: with a small corpus we never want
 * to filter results to zero.
 */

import { CONDITIONS, STATES, TOPICS, stateLabel } from "@/config/taxonomy";
import { SEARCH_SYNONYMS } from "@/config/search-synonyms";
import type { Question } from "./types";

/** Boost weights (added to a 0–1 similarity score) and the relevance floor. */
const BOOST = { city: 0.14, state: 0.08, condition: 0.1, topic: 0.06 } as const;
/** Untagged semantic hits below this are dropped as noise. */
const RELEVANCE_FLOOR = 0.3;
/** Base score given to keyword-only (FTS) hits, which lack a similarity. */
const KEYWORD_BASE = 0.4;

function hasTerm(haystack: string, term: string): boolean {
  const t = term.trim().toLowerCase();
  if (!t) return false;
  if (t.includes(" ")) return haystack.includes(t); // phrase → substring
  const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`).test(haystack); // word → boundary match
}

export type DetectedTags = {
  conditions: Set<string>;
  topics: Set<string>;
  state?: string;
  city?: string;
};

/** Pull structured intent (condition/topic/state/city) out of free-text. */
export function detectTags(query: string): DetectedTags {
  const q = ` ${query.toLowerCase()} `;
  const conditions = new Set<string>();
  const topics = new Set<string>();

  // Direct hits on taxonomy values/labels ("autism", "therapy", …)
  for (const c of CONDITIONS) {
    if (hasTerm(q, c.value.replace(/-/g, " ")) || hasTerm(q, c.label.toLowerCase())) {
      conditions.add(c.value);
    }
  }
  for (const t of TOPICS) {
    if (hasTerm(q, t.value.replace(/-/g, " "))) topics.add(t.value);
  }
  // Synonyms ("speech therapist" → speech-delay + therapy)
  for (const rule of SEARCH_SYNONYMS) {
    if (rule.match.some((m) => hasTerm(q, m))) {
      rule.conditions?.forEach((c) => conditions.add(c));
      rule.topics?.forEach((t) => topics.add(t));
    }
  }
  // State by its label ("tamil nadu")
  const state = STATES.find((s) => hasTerm(q, s.label.toLowerCase()))?.value;

  return { conditions, topics, state };
}

export type Candidate = {
  question: Question;
  /** 0–1 cosine similarity from vector search; undefined for keyword-only hits */
  similarity?: number;
  keyword: boolean;
};

/**
 * Rerank merged candidates by similarity + tag boosts, drop noise, sort.
 * Location is matched literally against each result's own city/state so we
 * don't need a hardcoded city list — "chennai" boosts the Chennai question.
 */
export function rerank(query: string, candidates: Candidate[]): Question[] {
  const q = ` ${query.toLowerCase()} `;
  const { conditions, topics } = detectTags(query);

  const scored = candidates.map(({ question, similarity, keyword }) => {
    let score = similarity ?? KEYWORD_BASE;
    let tagged = false;

    if (question.city && hasTerm(q, question.city.toLowerCase())) {
      score += BOOST.city;
      tagged = true;
    }
    if (question.state && hasTerm(q, stateLabel(question.state).toLowerCase())) {
      score += BOOST.state;
      tagged = true;
    }
    if (question.condition && conditions.has(question.condition)) {
      score += BOOST.condition;
      tagged = true;
    }
    if (question.topic && topics.has(question.topic)) {
      score += BOOST.topic;
      tagged = true;
    }
    return { question, score, tagged, keyword };
  });

  return scored
    // Keep anything that matched a tag or came from keyword search; otherwise
    // require a minimum semantic relevance.
    .filter((s) => s.tagged || s.keyword || s.score >= RELEVANCE_FLOOR)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.question);
}
