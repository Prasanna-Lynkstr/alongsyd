"use client";

import Link from "next/link";
import { useState } from "react";
import { flagScheme } from "@/app/schemes/actions";

/**
 * "This scheme is missing or wrong for my state" → routes to the admin/verified
 * queue to confirm and add.
 */
export default function FlagScheme({
  schemeId,
  state,
  signedIn,
}: {
  schemeId?: string;
  state?: string;
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (done) {
    return <p className="text-xs text-teal-strong">Flagged — we&apos;ll review it. Thank you.</p>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-faint underline decoration-dotted"
      >
        {schemeId ? "Wrong for my state?" : "Know a scheme we're missing?"}
      </button>
    );
  }

  if (!signedIn) {
    return (
      <p className="text-xs text-muted">
        <Link href="/login" className="font-medium text-teal-strong underline">
          Sign in
        </Link>{" "}
        to flag this for review.
      </p>
    );
  }

  return (
    <form
      action={async (formData) => {
        const err = await flagScheme(formData);
        if (err) setMsg(err);
        else setDone(true);
      }}
      className="mt-2 space-y-2 rounded-lg border border-line bg-cream p-3"
    >
      {schemeId && <input type="hidden" name="schemeId" value={schemeId} />}
      {state && <input type="hidden" name="state" value={state} />}
      <textarea
        name="note"
        rows={2}
        required
        placeholder={
          schemeId
            ? "What's wrong or different in your state?"
            : "Which scheme should we add, and where?"
        }
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-teal"
      />
      {msg && <p className="text-sm text-red-600">{msg}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-teal px-3 py-1.5 text-sm font-medium text-surface"
        >
          Send to reviewers
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
