"use client";

import { useState, useTransition } from "react";
import { toggleHelpful } from "@/app/(app)/ask/actions";

/**
 * The "This helped" reaction — the only reaction in Alongsyd (no downvotes).
 * Optimistic so it feels instant; the server action reconciles the count.
 */
export default function HelpfulButton({
  answerId,
  questionId,
  count,
  active,
}: {
  answerId: string;
  questionId: string;
  count: number;
  active: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState({ active, count });

  function onClick() {
    setOptimistic((s) => ({
      active: !s.active,
      count: s.count + (s.active ? -1 : 1),
    }));
    startTransition(() => toggleHelpful(answerId, questionId));
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      aria-pressed={optimistic.active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        optimistic.active
          ? "border-transparent bg-teal-soft text-teal-strong"
          : "border-line bg-surface text-muted"
      }`}
    >
      <span aria-hidden>{optimistic.active ? "💚" : "🤍"}</span>
      This helped
      {optimistic.count > 0 && (
        <span className="tabular-nums">· {optimistic.count}</span>
      )}
    </button>
  );
}
