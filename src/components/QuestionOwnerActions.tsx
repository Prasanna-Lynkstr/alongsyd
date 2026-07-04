"use client";

import { useState } from "react";
import { deleteQuestion, editQuestion } from "@/app/(app)/ask/actions";
import SubmitButton from "@/components/SubmitButton";

/**
 * Owner-only edit / delete for a question, shown only while it's inside the
 * edit window (the page decides that and simply doesn't render this otherwise).
 * Edit reveals an inline title+body form; delete asks for a one-tap confirm
 * first, since it's permanent. The server actions re-check ownership and the
 * window — this UI is the convenience layer, not the guard.
 */
export default function QuestionOwnerActions({
  questionId,
  title,
  body,
}: {
  questionId: string;
  title: string;
  body: string;
}) {
  const [mode, setMode] = useState<"idle" | "editing" | "confirmingDelete">(
    "idle",
  );

  if (mode === "editing") {
    return (
      <form action={editQuestion} className="mt-4 space-y-3 rounded-xl border border-line bg-cream/40 p-4">
        <input type="hidden" name="questionId" value={questionId} />
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">Question</span>
          <input
            name="title"
            required
            maxLength={140}
            defaultValue={title}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-teal"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">Detail</span>
          <textarea
            name="body"
            rows={4}
            defaultValue={body}
            className="w-full resize-y rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-teal"
          />
        </label>
        <div className="flex items-center gap-2">
          <SubmitButton
            pendingLabel="Saving…"
            className="rounded-lg bg-teal px-4 py-1.5 text-xs font-semibold text-surface"
          >
            Save changes
          </SubmitButton>
          <button
            type="button"
            onClick={() => setMode("idle")}
            className="rounded-lg border border-line px-4 py-1.5 text-xs text-muted"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  if (mode === "confirmingDelete") {
    return (
      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-700">Delete this question?</p>
        <p className="mt-0.5 text-xs text-red-600">
          This is permanent — the question and its answers will be removed.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <form action={deleteQuestion}>
            <input type="hidden" name="questionId" value={questionId} />
            <SubmitButton
              pendingLabel="Deleting…"
              className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white"
            >
              Yes, delete
            </SubmitButton>
          </form>
          <button
            type="button"
            onClick={() => setMode("idle")}
            className="rounded-lg border border-line px-4 py-1.5 text-xs text-muted"
          >
            Keep it
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-3 border-t border-line pt-3">
      <span className="text-xs text-faint">Your question ·</span>
      <button
        type="button"
        onClick={() => setMode("editing")}
        className="text-xs font-medium text-teal-strong"
      >
        ✎ Edit
      </button>
      <button
        type="button"
        onClick={() => setMode("confirmingDelete")}
        className="text-xs font-medium text-red-600"
      >
        🗑 Delete
      </button>
    </div>
  );
}
