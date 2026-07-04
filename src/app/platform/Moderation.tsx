import { conditionLabel, stateLabel } from "@/config/taxonomy";
import { timeAgo } from "@/components/ui";
import type { FlagRow, ParentRow, ReportRow } from "@/engine/analytics";
import {
  moderateRemoveContent,
  moderateResolveFlag,
  moderateResolveReport,
  moderateSetVerified,
} from "./actions";

/**
 * The moderation surface, living inside the owner console so the app owner can
 * act — not just watch. Same capabilities as the in-app /admin queue (remove
 * content, dismiss reports, review flags, verify parents), but gated by the
 * platform key. Server-action forms; no client JS.
 */
export default function Moderation({
  reports,
  flags,
  parents,
}: {
  reports: ReportRow[];
  flags: FlagRow[];
  parents: ParentRow[];
}) {
  return (
    <section className="mt-4 rounded-2xl border border-line bg-surface p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-ink">Moderation</h2>
        <p className="text-xs text-faint">
          Act on the queues here — changes are live for parents immediately.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Content reports */}
        <Queue title="Content reports" count={reports.length}>
          {reports.length === 0 ? (
            <Empty>No open reports.</Empty>
          ) : (
            reports.map((r) => (
              <div key={r.id} className="rounded-xl border border-line bg-cream/40 p-3">
                <div className="flex items-center justify-between text-xs text-faint">
                  <span className="font-medium uppercase tracking-wide">
                    {r.targetType.replace("_", " ")}
                  </span>
                  <span>{timeAgo(r.createdAt)}</span>
                </div>
                {r.reason && (
                  <p className="mt-1 text-sm text-ink/90">“{r.reason}”</p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <form action={moderateRemoveContent}>
                    <input type="hidden" name="type" value={r.targetType} />
                    <input type="hidden" name="id" value={r.targetId} />
                    <button className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white">
                      Remove content
                    </button>
                  </form>
                  <form action={moderateResolveReport}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="rounded-lg border border-line px-3 py-1.5 text-xs text-muted">
                      Dismiss
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </Queue>

        {/* Scheme flags */}
        <Queue title="Scheme flags" count={flags.length}>
          {flags.length === 0 ? (
            <Empty>No scheme flags.</Empty>
          ) : (
            flags.map((f) => (
              <div key={f.id} className="rounded-xl border border-line bg-cream/40 p-3">
                <div className="flex items-center justify-between text-xs text-faint">
                  <span className="font-medium">
                    {f.scheme}
                    {f.state ? ` · ${f.state}` : ""}
                  </span>
                  <span>{timeAgo(f.createdAt)}</span>
                </div>
                {f.note && <p className="mt-1 text-sm text-ink/90">“{f.note}”</p>}
                <form action={moderateResolveFlag} className="mt-2">
                  <input type="hidden" name="id" value={f.id} />
                  <button className="rounded-lg border border-line px-3 py-1.5 text-xs text-muted">
                    Mark reviewed
                  </button>
                </form>
              </div>
            ))
          )}
        </Queue>
      </div>

      {/* Verify parents */}
      <div className="mt-6">
        <Queue title="Verify parents" count={parents.length} hideCount>
          <p className="-mt-1 mb-2 text-xs text-muted">
            Mark trusted experts / veteran parents as verified — their answers get
            a badge. Showing the 30 most recent.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {parents.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-line bg-cream/40 p-3"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="text-xl" aria-hidden>
                    {p.avatar}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">
                      {p.alias || "—"}
                      {p.isAdmin ? " · 🛡️" : ""}
                    </span>
                    <span className="block truncate text-xs text-faint">
                      {conditionLabel(p.condition) || "—"}
                      {p.state ? ` · ${stateLabel(p.state)}` : ""}
                    </span>
                  </span>
                </span>
                <form action={moderateSetVerified}>
                  <input type="hidden" name="userId" value={p.id} />
                  <input
                    type="hidden"
                    name="verified"
                    value={p.isVerified ? "false" : "true"}
                  />
                  <button
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
                      p.isVerified
                        ? "border border-line text-muted"
                        : "bg-teal text-surface"
                    }`}
                  >
                    {p.isVerified ? "Verified ✓" : "Verify"}
                  </button>
                </form>
              </div>
            ))}
          </div>
        </Queue>
      </div>
    </section>
  );
}

function Queue({
  title,
  count,
  hideCount = false,
  children,
}: {
  title: string;
  count: number;
  hideCount?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-faint">
        {title}
        {!hideCount && count > 0 && (
          <span className="text-teal-strong"> ({count})</span>
        )}
      </h3>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}
