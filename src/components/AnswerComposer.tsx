"use client";

import { useRef, useState } from "react";
import { ANSWER_GUIDANCE, PLACEHOLDERS, detectPossibleChildName } from "@/engine/moderation";
import { postAnswer } from "@/app/(app)/ask/actions";

/** Compose an answer. Shows the supportive-phrasing nudge (guided posting). */
export default function AnswerComposer({ questionId }: { questionId: string }) {
  const [body, setBody] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const nameWarning = detectPossibleChildName(body);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await postAnswer(formData);
        setBody("");
        formRef.current?.reset();
      }}
      className="space-y-3 rounded-2xl border border-line bg-surface p-4"
    >
      <input type="hidden" name="questionId" value={questionId} />
      <p className="flex items-start gap-2 text-sm text-teal-strong">
        <span aria-hidden>💬</span>
        <span>{ANSWER_GUIDANCE}</span>
      </p>
      <textarea
        name="body"
        required
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={PLACEHOLDERS.answerBody}
        className="w-full resize-y rounded-xl border border-line bg-cream px-4 py-3 outline-none focus:border-teal"
      />
      {nameWarning.flagged && (
        <p className="rounded-lg bg-amber-soft px-4 py-2.5 text-sm text-amber">
          💛 {nameWarning.reason}
        </p>
      )}
      <button
        type="submit"
        className="w-full rounded-xl bg-teal py-3 font-semibold text-surface"
      >
        Share your answer
      </button>
    </form>
  );
}
