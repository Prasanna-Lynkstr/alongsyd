"use client";

import { useState } from "react";
import { reportContent } from "@/app/(app)/ask/actions";

/** A quiet "report" affordance → admin queue. Opens a tiny inline form. */
export default function ReportButton({
  targetType,
  targetId,
  questionId,
}: {
  targetType: "question" | "answer" | "scheme_note";
  targetId: string;
  questionId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  if (done) {
    return <span className="text-xs text-faint">Reported — thank you</span>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-faint underline decoration-dotted"
      >
        Report
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await reportContent(formData);
        setDone(true);
      }}
      className="mt-2 space-y-2 rounded-lg border border-line bg-cream p-3"
    >
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="targetId" value={targetId} />
      {questionId && <input type="hidden" name="questionId" value={questionId} />}
      <textarea
        name="reason"
        rows={2}
        placeholder="What's wrong with this? (optional)"
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-teal"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-teal px-3 py-1.5 text-sm font-medium text-surface"
        >
          Send report
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-3 py-1.5 text-sm text-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
