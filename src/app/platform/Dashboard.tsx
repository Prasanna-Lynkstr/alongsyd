import Link from "next/link";
import Brand from "@/components/Brand";
import { COUNTRY } from "@/config/country";
import type { Bucket, PlatformStats, Slice } from "@/engine/analytics";
import Moderation from "./Moderation";
import { signOutPlatform } from "./actions";

/**
 * The platform-owner dashboard. One scroll, grouped the way an owner actually
 * thinks: How big? → Growing? → Are people activating? → What do they need? →
 * Is the second pillar (benefits) landing? → What needs a hand today? → Where
 * do we grow next? Every number is derived from the live schema.
 */
export default function Dashboard({ stats }: { stats: PlatformStats }) {
  const { totals, growth, engagement, weekly, demand, benefits, content } =
    stats;
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Brand size="sm" href={null} />
          <span className="rounded-full bg-teal-soft px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-teal-strong">
            Platform console
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-xs text-faint sm:inline">
            {COUNTRY.flag} {COUNTRY.name} · pilot · {fmtTime(stats.generatedAt)}
          </span>
          <form action={signOutPlatform}>
            <button className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-muted">
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* 1 · Headline KPIs */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Parents" value={totals.parents} hint={`+${growth.parents7} this week`} tone="teal" />
        <Kpi label="Onboarded" value={totals.onboarded} hint={`${pct(totals.onboarded, totals.parents)}% of signups`} />
        <Kpi label="Questions" value={totals.questions} hint={`+${growth.questions7} this week`} />
        <Kpi label="Answers" value={totals.answers} hint={`+${growth.answers7} this week`} />
        <Kpi label="Answer rate" value={`${engagement.answerRate}%`} hint={`${engagement.unanswered} unanswered`} tone={engagement.answerRate >= 70 ? "teal" : "amber"} />
        <Kpi label="Activation" value={`${engagement.activation}%`} hint={`${engagement.contributors} contributors`} />
      </section>

      {/* 2 · Growth */}
      <Panel title="Growth" hint="Last 8 weeks">
        <div className="grid gap-6 sm:grid-cols-3">
          <Trend title="New parents" data={weekly.parents} sub={`${growth.parents30} in 30 days`} />
          <Trend title="New questions" data={weekly.questions} sub={`+${growth.questions7} this week`} />
          <Trend title="New answers" data={weekly.answers} sub={`+${growth.answers7} this week`} />
        </div>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* 3 · Activation funnel */}
        <Panel title="Activation funnel" hint="Distinct parents reaching each step">
          <Funnel steps={stats.funnel} />
        </Panel>

        {/* 6 · Needs attention */}
        <Panel
          title="Needs a hand"
          hint="Act on these to keep the loop healthy"
          cta={{ href: "#moderation", label: "Go to moderation →" }}
        >
          <div className="grid grid-cols-3 gap-2">
            <Mini label="Open reports" value={stats.moderation.openReports} alert={stats.moderation.openReports > 0} />
            <Mini label="Scheme flags" value={stats.moderation.openFlags} alert={stats.moderation.openFlags > 0} />
            <Mini label="Removed" value={content.removedQuestions + content.removedAnswers} />
          </div>
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide text-faint">
            Oldest unanswered questions
          </p>
          {content.unansweredOldest.length === 0 ? (
            <p className="text-sm text-muted">Every question has an answer. 🎉</p>
          ) : (
            <ul className="space-y-2">
              {content.unansweredOldest.slice(0, 5).map((q) => (
                <li key={q.id} className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-ink">{q.title}</span>
                    <span className="text-xs text-faint">{q.condition}</span>
                  </span>
                  <span className="shrink-0 whitespace-nowrap text-xs font-medium text-amber">
                    {q.ageDays}d waiting
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* 4 · What parents need */}
      <Panel title="What parents are asking about" hint="Demand signals from live questions">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <BarList title="Conditions" items={demand.conditions} />
          <BarList title="Topics" items={demand.topics} />
          <BarList title="Life stage" items={demand.ageBands} />
          <BarList title="States" items={demand.states} />
        </div>
      </Panel>

      {/* 5 · Benefits pillar */}
      <Panel title="Benefits engagement" hint="The second pillar — schemes & entitlements">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr_1fr]">
          <div>
            <div className="grid grid-cols-2 gap-2">
              <Mini label="Saved schemes" value={totals.savedSchemes} />
              <Mini label="Active claimers" value={benefits.activeClaimers} />
              <Mini label="Docs checked" value={benefits.docChecks} />
              <Mini label="Parent notes" value={benefits.notes} />
            </div>
          </div>
          <BarList title="Most-saved schemes" items={benefits.topSaved} />
          <BarList
            title="Flagged as missing / wrong"
            items={benefits.flagSchemes}
            empty="No open scheme flags."
          />
        </div>
      </Panel>

      {/* 6b · Moderation (act, don't just watch) */}
      <div id="moderation" className="scroll-mt-6">
        <Moderation
          reports={stats.moderation.reports}
          flags={stats.moderation.flags}
          parents={stats.parents}
        />
      </div>

      {/* 7 · Roadmap signals */}
      <Panel
        title="Where the demand points next"
        hint="Planned super-app surfaces, ranked by signal in your own data"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.roadmap.map((r, i) => (
            <div
              key={r.surface}
              className="flex flex-col rounded-2xl border border-line bg-cream/60 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-teal-soft text-xs font-semibold text-teal-strong">
                  {i + 1}
                </span>
                <span className="text-lg font-semibold text-ink">{r.demand}</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-ink">{r.surface}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{r.basis}</p>
            </div>
          ))}
        </div>
      </Panel>

      <p className="mt-8 text-center text-xs text-faint">
        Pilot-scale analytics · aggregated live from the database · never exposes
        a child&apos;s name or a parent&apos;s phone.
      </p>
    </main>
  );
}

/* ── presentational primitives ─────────────────────────────────────────── */

function Kpi({
  label,
  value,
  hint,
  tone = "plain",
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "plain" | "teal" | "amber";
}) {
  const ring =
    tone === "teal"
      ? "border-teal/30 bg-teal-soft/40"
      : tone === "amber"
        ? "border-amber/30 bg-amber-soft/50"
        : "border-line bg-surface";
  return (
    <div className={`rounded-2xl border p-4 ${ring}`}>
      <p className="text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-muted">{label}</p>
      {hint && <p className="mt-1 text-[11px] text-faint">{hint}</p>}
    </div>
  );
}

function Panel({
  title,
  hint,
  cta,
  children,
}: {
  title: string;
  hint?: string;
  cta?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4 rounded-2xl border border-line bg-surface p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {hint && <p className="text-xs text-faint">{hint}</p>}
        </div>
        {cta && (
          <Link href={cta.href} className="shrink-0 text-xs font-medium text-teal-strong">
            {cta.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Mini({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-3 ${alert ? "border-amber/40 bg-amber-soft/50" : "border-line bg-cream/50"}`}>
      <p className={`text-lg font-semibold ${alert ? "text-amber" : "text-ink"}`}>{value}</p>
      <p className="text-[11px] leading-tight text-muted">{label}</p>
    </div>
  );
}

/** Horizontal ranked bars, scaled to the largest value in the set. */
function BarList({
  title,
  items,
  empty = "No data yet.",
}: {
  title: string;
  items: Slice[];
  empty?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((it) => (
            <li key={it.key} className="flex items-center gap-2">
              <span className="w-28 shrink-0 truncate text-xs text-ink" title={it.label}>
                {it.label}
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream">
                <span
                  className="block h-full rounded-full bg-teal"
                  style={{ width: `${Math.round((it.count / max) * 100)}%` }}
                />
              </span>
              <span className="w-6 shrink-0 text-right text-xs font-medium text-muted">
                {it.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** 8-week sparkline as bars; the newest week is emphasised. */
function Trend({
  title,
  data,
  sub,
}: {
  title: string;
  data: Bucket[];
  sub: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const latest = data[data.length - 1]?.value ?? 0;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-faint">{title}</p>
        <p className="text-lg font-semibold text-ink">{latest}</p>
      </div>
      <div className="mt-2 flex h-12 items-end gap-1" aria-hidden>
        {data.map((d, i) => (
          <span
            key={i}
            title={`${d.label}: ${d.value}`}
            className={`flex-1 rounded-sm ${i === data.length - 1 ? "bg-teal" : "bg-teal/30"}`}
            style={{ height: `${Math.max(6, Math.round((d.value / max) * 100))}%` }}
          />
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-faint">{sub}</p>
    </div>
  );
}

/** Funnel: each step's bar width is relative to the first step. */
function Funnel({ steps }: { steps: Slice[] }) {
  const top = Math.max(1, steps[0]?.count ?? 1);
  return (
    <ul className="space-y-2">
      {steps.map((s, i) => {
        const ofTop = Math.round((s.count / top) * 100);
        const prev = steps[i - 1]?.count ?? 0;
        const conv = i === 0 ? null : prev ? Math.round((s.count / prev) * 100) : 0;
        return (
          <li key={s.key}>
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span className="text-ink">{s.label}</span>
              <span className="text-faint">
                <b className="text-muted">{s.count}</b>
                {conv !== null && <span> · {conv}%</span>}
              </span>
            </div>
            <span className="block h-6 overflow-hidden rounded-lg bg-cream">
              <span
                className="flex h-full items-center rounded-lg bg-teal/80 px-2 text-[11px] font-medium text-surface"
                style={{ width: `${Math.max(ofTop, 4)}%` }}
              >
                {ofTop >= 12 ? `${ofTop}%` : ""}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
