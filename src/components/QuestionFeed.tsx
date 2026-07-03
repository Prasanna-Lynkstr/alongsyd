"use client";

import { useState, useTransition } from "react";
import type { Question } from "@/engine/types";
import QuestionCard from "@/components/QuestionCard";
import { fetchMoreQuestions } from "@/app/(app)/ask/actions";

const PAGE_SIZE = 20; // must match FEED_PAGE_SIZE in engine/queries

/**
 * The browse feed with keyset "load more". Starts from the server-rendered
 * first page and appends older pages on demand, using the last item's
 * created_at as the cursor (no OFFSET, so it stays fast at any depth).
 */
export default function QuestionFeed({
  initial,
  condition,
  topic,
  state,
  unanswered,
}: {
  initial: Question[];
  condition?: string;
  topic?: string;
  state?: string;
  unanswered?: boolean;
}) {
  const [items, setItems] = useState<Question[]>(initial);
  const [done, setDone] = useState(initial.length < PAGE_SIZE);
  const [pending, startTransition] = useTransition();

  function loadMore() {
    const last = items[items.length - 1];
    if (!last) return;
    startTransition(async () => {
      const more = await fetchMoreQuestions(
        { condition, topic, state, unanswered },
        last.createdAt,
      );
      setItems((prev) => [...prev, ...more]);
      if (more.length < PAGE_SIZE) setDone(true);
    });
  }

  return (
    <div className="space-y-3">
      {items.map((question) => (
        <div key={question.id} className="animate-in">
          <QuestionCard question={question} />
        </div>
      ))}

      {!done && (
        <button
          onClick={loadMore}
          disabled={pending}
          className="w-full rounded-xl border border-line bg-surface py-3 text-sm font-medium text-muted disabled:opacity-60"
        >
          {pending ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}
