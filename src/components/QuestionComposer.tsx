"use client";

import { useState } from "react";
import { CONDITIONS, TOPICS } from "@/config/taxonomy";
import { PLACEHOLDERS, detectPossibleChildName } from "@/engine/moderation";
import { postQuestion } from "@/app/(app)/ask/actions";

export default function QuestionComposer({
  defaultCondition,
  defaultAge,
}: {
  defaultCondition: string | null;
  defaultAge: number | null;
}) {
  const [body, setBody] = useState("");
  const nameWarning = detectPossibleChildName(body);

  return (
    <form action={postQuestion} className="space-y-5">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">
          Your question
        </span>
        <input
          name="title"
          required
          maxLength={140}
          placeholder={PLACEHOLDERS.questionTitle}
          className="w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-teal"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">
          A bit more detail
        </span>
        <textarea
          name="body"
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={PLACEHOLDERS.questionBody}
          className="w-full resize-y rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-teal"
        />
      </label>

      {nameWarning.flagged && (
        <p className="rounded-lg bg-amber-soft px-4 py-3 text-sm text-amber">
          💛 {nameWarning.reason}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">
            Condition
          </span>
          <select
            name="condition"
            defaultValue={defaultCondition ?? ""}
            className="w-full rounded-xl border border-line bg-surface px-3 py-3 outline-none focus:border-teal"
          >
            <option value="">Not specific</option>
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">
            Child&apos;s age
          </span>
          <input
            name="childAge"
            type="number"
            min={0}
            max={60}
            defaultValue={defaultAge ?? ""}
            placeholder="e.g. 6"
            className="w-full rounded-xl border border-line bg-surface px-3 py-3 outline-none focus:border-teal"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">
          Topic <span className="font-normal text-faint">(optional)</span>
        </span>
        <select
          name="topic"
          defaultValue=""
          className="w-full rounded-xl border border-line bg-surface px-3 py-3 outline-none focus:border-teal"
        >
          <option value="">Choose a topic…</option>
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <p className="text-xs text-faint">
        Please refer to your child by age + condition, never by name — it keeps
        them private.
      </p>

      <button
        type="submit"
        className="w-full rounded-xl bg-teal py-3.5 font-semibold text-surface"
      >
        Post question
      </button>
    </form>
  );
}
