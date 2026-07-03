"use client";

import { useState, useTransition } from "react";
import { toggleFollow, toggleSaveQuestion } from "@/app/(app)/personal/actions";

/**
 * Follow (get notified of new answers) and Save (bookmark) controls for a
 * question. Shown together under a question so a parent can keep a thread they
 * care about even if they didn't ask it.
 */
export default function QuestionActions({
  questionId,
  initialFollowing,
  initialSaved,
}: {
  questionId: string;
  initialFollowing: boolean;
  initialSaved: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [saved, setSaved] = useState(initialSaved);
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() =>
          start(async () => {
            setFollowing((f) => !f);
            setFollowing(await toggleFollow(questionId));
          })
        }
        disabled={pending}
        aria-pressed={following}
        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition ${
          following
            ? "border-teal bg-teal-soft text-teal-strong"
            : "border-line bg-surface text-muted"
        }`}
      >
        {following ? "🔔 Following" : "🔔 Follow"}
      </button>
      <button
        onClick={() =>
          start(async () => {
            setSaved((s) => !s);
            setSaved(await toggleSaveQuestion(questionId));
          })
        }
        disabled={pending}
        aria-pressed={saved}
        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition ${
          saved
            ? "border-teal bg-teal-soft text-teal-strong"
            : "border-line bg-surface text-muted"
        }`}
      >
        {saved ? "★ Saved" : "☆ Save"}
      </button>
    </div>
  );
}
