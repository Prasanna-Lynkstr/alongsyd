import Link from "next/link";
import { requireOnboardedProfile } from "@/engine/auth";
import { listQuestions, searchQuestions } from "@/engine/queries";
import type { Question } from "@/engine/types";
import SearchBar from "@/components/SearchBar";
import FeedFilters from "@/components/FeedFilters";
import SearchFacets, { type Facets } from "@/components/SearchFacets";
import QuestionCard from "@/components/QuestionCard";
import QuestionFeed from "@/components/QuestionFeed";
import PushOptIn from "@/components/PushOptIn";
import { EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

/** Distinct tag values present in a result set, preserving first-seen order. */
function facetsFrom(questions: Question[]): Facets {
  const uniq = (vals: (string | null)[]) => [
    ...new Set(vals.filter((v): v is string => Boolean(v))),
  ];
  return {
    conditions: uniq(questions.map((q) => q.condition)),
    cities: uniq(questions.map((q) => q.city)),
    topics: uniq(questions.map((q) => q.topic)),
  };
}

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    condition?: string;
    city?: string;
    topic?: string;
  }>;
}) {
  await requireOnboardedProfile();
  const { q, condition, city, topic } = await searchParams;

  const searching = Boolean(q && q.trim());

  // Search: get the full reranked set, derive facets from it, then hard-filter
  // by any active chips. Feed: filter by the feed's own condition/topic chips.
  const allResults = searching ? await searchQuestions(q!) : [];
  const facets = searching ? facetsFrom(allResults) : { conditions: [], cities: [], topics: [] };
  const questions = searching
    ? allResults.filter(
        (r) =>
          (!condition || r.condition === condition) &&
          (!city || r.city === city) &&
          (!topic || r.topic === topic),
      )
    : await listQuestions({ condition, topic });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Ask</h1>
        <p className="text-sm text-muted">
          Real questions, answered by parents who&apos;ve been there.
        </p>
      </div>

      <SearchBar initial={q ?? ""} />

      {/* On desktop this splits into a feed column + a sticky context rail; on
          mobile the grid collapses and DOM order restores the phone stack
          (filters → prompt → feed). */}
      <div className="gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <aside className="space-y-4 lg:col-start-2 lg:row-start-1 lg:sticky lg:top-8">
          {!searching && <FeedFilters condition={condition} topic={topic} />}

          {searching && (
            <SearchFacets q={q!} facets={facets} active={{ condition, city, topic }} />
          )}

          {!searching && <PushOptIn />}

          <Link
            href="/ask/new"
            className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-teal/50 bg-teal-soft/50 py-3.5 font-semibold text-teal-strong"
          >
            <span aria-hidden>✏️</span> Ask a question
          </Link>
        </aside>

        <div className="mt-4 space-y-3 lg:col-start-1 lg:row-start-1 lg:mt-0">
          {searching && (
            <p className="text-sm text-muted">
              {questions.length} result{questions.length === 1 ? "" : "s"} for{" "}
              <b>“{q}”</b>
            </p>
          )}

          {questions.length === 0 ? (
            searching ? (
              <EmptyState title="No matches with these filters">
                Clear a filter above, try different words, or ask it yourself and
                let the community help.
              </EmptyState>
            ) : (
              <EmptyState title="Nothing here with this filter">
                Clear the filter, or be the first to ask.
              </EmptyState>
            )
          ) : searching ? (
            // Search results are already bounded/ranked — no pagination needed.
            questions.map((question) => (
              <div key={question.id} className="animate-in">
                <QuestionCard question={question} />
              </div>
            ))
          ) : (
            <QuestionFeed initial={questions} condition={condition} topic={topic} />
          )}
        </div>
      </div>
    </div>
  );
}
