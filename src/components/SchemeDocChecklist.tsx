"use client";

import { useState, useTransition } from "react";
import { toggleSchemeDoc } from "@/app/(app)/personal/actions";
import { Chip } from "@/components/ui";

/**
 * The "documents you'll need" list. For signed-in parents it's an interactive,
 * persisted checklist (tick papers off as you gather them); for everyone else
 * it's the plain chips. Turns a decorative list into a real gathering tool.
 */
export default function SchemeDocChecklist({
  schemeId,
  documents,
  interactive,
  initialChecked,
}: {
  schemeId: string;
  documents: string[];
  interactive: boolean;
  initialChecked: number[];
}) {
  const [checked, setChecked] = useState<Set<number>>(
    () => new Set(initialChecked),
  );
  const [pending, start] = useTransition();

  if (!interactive) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {documents.map((d, i) => (
          <Chip key={i}>{d}</Chip>
        ))}
      </div>
    );
  }

  function toggle(i: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
    start(async () => {
      await toggleSchemeDoc(schemeId, i);
    });
  }

  return (
    <div className="space-y-1.5">
      <ul className="space-y-1">
        {documents.map((d, i) => {
          const on = checked.has(i);
          return (
            <li key={i}>
              <button
                onClick={() => toggle(i)}
                disabled={pending}
                className="flex w-full items-start gap-2 text-left text-sm"
              >
                <span
                  className={`mt-0.5 grid h-4 w-4 flex-none place-items-center rounded border text-[10px] ${
                    on
                      ? "border-teal bg-teal text-surface"
                      : "border-line bg-surface text-transparent"
                  }`}
                  aria-hidden
                >
                  ✓
                </span>
                <span className={on ? "text-muted line-through" : "text-ink/90"}>
                  {d}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-faint">
        {checked.size}/{documents.length} gathered
      </p>
    </div>
  );
}
