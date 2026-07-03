"use client";

import Link from "next/link";
import { useState } from "react";
import { PLACEHOLDERS } from "@/engine/moderation";
import { addSchemeNote } from "@/app/schemes/actions";

/** "Did this apply to you? What helped?" → feeds the crowd notes. */
export default function AddSchemeNote({
  schemeId,
  state,
  signedIn,
}: {
  schemeId: string;
  state?: string;
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!signedIn) {
    return (
      <div className="rounded-xl bg-teal-soft/60 p-3 text-sm">
        <span className="text-teal-strong">
          Did this apply to you? Your tip could save another parent weeks.
        </span>{" "}
        <Link href="/login" className="font-semibold text-teal-strong underline">
          Sign in to add what helped →
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <p className="rounded-xl bg-teal-soft/60 p-3 text-sm text-teal-strong">
        💚 Thank you — your experience is now helping other parents.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border border-teal/40 bg-teal-soft/50 px-4 py-2.5 text-sm font-medium text-teal-strong"
      >
        + Did this apply to you? Share what helped
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        const err = await addSchemeNote(formData);
        if (err) setMsg(err);
        else setDone(true);
      }}
      className="space-y-2 rounded-xl border border-line bg-cream p-3"
    >
      <input type="hidden" name="schemeId" value={schemeId} />
      {state && <input type="hidden" name="state" value={state} />}
      <textarea
        name="body"
        required
        rows={3}
        placeholder={PLACEHOLDERS.schemeNote}
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-teal"
      />
      <input
        name="district"
        placeholder="District (optional) — helps others nearby"
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-teal"
      />
      {msg && <p className="text-sm text-red-600">{msg}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-surface"
        >
          Share
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-3 py-2 text-sm text-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
