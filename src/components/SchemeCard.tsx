import type { Scheme } from "@/config/schemes";
import type { SchemeNote } from "@/engine/types";
import { stateLabel } from "@/config/taxonomy";
import { AuthorTag, Chip, timeAgo } from "@/components/ui";
import AddSchemeNote from "@/components/AddSchemeNote";
import FlagScheme from "@/components/FlagScheme";
import SaveSchemeButton from "@/components/SaveSchemeButton";
import SchemeDocChecklist from "@/components/SchemeDocChecklist";

/**
 * One scheme = two clearly separated layers:
 *   1. OFFICIAL BASELINE  — the authoritative rule (teal, badged "Official").
 *   2. PARENT EXPERIENCES  — crowd notes (amber, badged "From parents").
 * Keeping these visually distinct matters: a wrong claim wastes weeks, so a
 * parent must always know which is the rule and which is lived experience.
 */
export default function SchemeCard({
  scheme,
  notes,
  state,
  signedIn,
  saved = false,
  docChecks = [],
}: {
  scheme: Scheme;
  notes: SchemeNote[];
  state?: string;
  signedIn: boolean;
  /** Whether the current parent has bookmarked this scheme. */
  saved?: boolean;
  /** Document indices this parent has already ticked off. */
  docChecks?: number[];
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface">
      {/* ---- Official baseline ------------------------------------------- */}
      <div className="border-l-4 border-teal p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-teal-strong">
              ✓ Official baseline
            </span>
            <Chip>{scheme.level === "national" ? "National" : "State"}</Chip>
          </div>
          {signedIn && (
            <SaveSchemeButton schemeId={scheme.id} initialSaved={saved} />
          )}
        </div>

        <h3 className="text-lg font-semibold text-ink">{scheme.name}</h3>
        <p className="mt-0.5 text-xs text-faint">{scheme.authority}</p>
        <p className="mt-2 text-sm text-ink/90">{scheme.summary}</p>

        <Section title="What you get">
          <ul className="space-y-1">
            {scheme.benefits.map((b, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink/90">
                <span className="text-teal" aria-hidden>
                  •
                </span>
                {b}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Who's eligible">
          <p className="text-sm text-ink/90">
            {scheme.eligibility.notes || "See official guidance."}
          </p>
          {scheme.eligibility.minDisabilityPercent ? (
            <p className="mt-1 text-xs text-muted">
              Usually needs a disability certificate of at least{" "}
              {scheme.eligibility.minDisabilityPercent}%.
            </p>
          ) : null}
        </Section>

        <Section title="How to claim">
          <ol className="space-y-1.5">
            {scheme.claimSteps.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-ink/90">
                <span className="grid h-5 w-5 flex-none place-items-center rounded-full bg-teal-soft text-[11px] font-semibold text-teal-strong">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </Section>

        {scheme.documents.length > 0 && (
          <Section title="Documents you'll likely need">
            <SchemeDocChecklist
              schemeId={scheme.id}
              documents={scheme.documents}
              interactive={signedIn}
              initialChecked={docChecks}
            />
          </Section>
        )}

        {scheme.officialLink && (
          <a
            href={scheme.officialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-strong underline"
          >
            Official page ↗
          </a>
        )}
      </div>

      {/* ---- Parent experiences ------------------------------------------ */}
      <div className="border-t border-line bg-amber-soft/30 p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber">
            ★ From parents
          </span>
          <span className="text-xs text-faint">
            Real experiences — not official rules. Confirm before you rely on them.
          </span>
        </div>

        {notes.length === 0 ? (
          <p className="text-sm text-muted">
            No parent notes yet{state ? ` for ${stateLabel(state)}` : ""}. Be the
            first to share how claiming this went.
          </p>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => (
              <li key={note.id} className="rounded-xl bg-surface p-3">
                <div className="flex items-center justify-between">
                  <AuthorTag author={note.author} />
                  <span className="text-xs text-faint">
                    {note.state ? stateLabel(note.state) : ""}
                    {note.district ? ` · ${note.district}` : ""} ·{" "}
                    {timeAgo(note.createdAt)}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-ink/90">
                  {note.body}
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 space-y-2">
          <AddSchemeNote schemeId={scheme.id} state={state} signedIn={signedIn} />
          <div>
            <FlagScheme schemeId={scheme.id} state={state} signedIn={signedIn} />
          </div>
        </div>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-faint">
        {title}
      </p>
      {children}
    </div>
  );
}
