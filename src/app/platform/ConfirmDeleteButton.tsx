"use client";

import { useState } from "react";
import SubmitButton from "@/components/SubmitButton";

/**
 * A destructive submit guarded by a confirmation toast. Rendered inside a
 * server-action <form>: the trigger opens a bottom toast, and its "Delete"
 * button (a real submit) runs the form's action. This is the only client
 * interaction on the otherwise server-rendered platform console, added so a
 * permanent delete can't fire from a single stray click.
 */
export default function ConfirmDeleteButton({
  triggerLabel = "Delete permanently",
  message,
}: {
  triggerLabel?: string;
  message: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-red-300 bg-surface px-3 py-1.5 text-xs font-medium text-red-700"
      >
        {triggerLabel}
      </button>

      {open && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
        >
          <div className="flex max-w-md items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-lg">
            <span className="text-sm text-ink">{message}</span>
            <SubmitButton
              pendingLabel="Deleting…"
              className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Delete
            </SubmitButton>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs text-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
