import { PLANNED_SURFACES } from "@/config/welcome";

/**
 * The "what's coming" hint, shown inside the signed-in app so a parent sees the
 * same horizon the landing page promises — the feed is one room, not the whole
 * house. Reuses PLANNED_SURFACES so landing and app never drift. Illustrative
 * direction, not dated commitments.
 */
export default function HorizonStrip() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-xs font-semibold text-ink">More of the journey is coming</p>
      <p className="mt-0.5 text-xs leading-relaxed text-muted">
        Community answers are step one. Next, we&apos;re building the things
        families spend weeks hunting for:
      </p>
      <ul className="mt-3 space-y-1.5">
        {PLANNED_SURFACES.map((s) => (
          <li key={s} className="flex items-center gap-2 text-xs text-muted">
            <span aria-hidden className="text-faint">
              ○
            </span>
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
