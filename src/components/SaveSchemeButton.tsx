"use client";

import { useState, useTransition } from "react";
import { toggleSaveScheme } from "@/app/(app)/personal/actions";

/** Bookmark toggle for a scheme ("save to my schemes to claim"). */
export default function SaveSchemeButton({
  schemeId,
  initialSaved,
}: {
  schemeId: string;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, start] = useTransition();

  return (
    <button
      onClick={() =>
        start(async () => {
          setSaved((s) => !s); // optimistic
          const next = await toggleSaveScheme(schemeId);
          setSaved(next);
        })
      }
      disabled={pending}
      aria-pressed={saved}
      className={`inline-flex flex-none items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition ${
        saved
          ? "border-teal bg-teal-soft text-teal-strong"
          : "border-line bg-surface text-muted"
      }`}
    >
      {saved ? "★ Saved" : "☆ Save"}
    </button>
  );
}
