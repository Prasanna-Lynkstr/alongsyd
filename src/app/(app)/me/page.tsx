import Link from "next/link";
import { requireOnboardedProfile } from "@/engine/auth";
import {
  getContributionStats,
  listMyAnswers,
  listMyQuestions,
} from "@/engine/queries";
import {
  ageBandLabel,
  conditionLabel,
  stateLabel,
} from "@/config/taxonomy";
import { ageToBand } from "@/config/taxonomy";
import { VerifiedBadge } from "@/components/ui";
import QuestionCard from "@/components/QuestionCard";
import PushOptIn from "@/components/PushOptIn";
import { signOut } from "./actions";

export default async function MePage() {
  const profile = await requireOnboardedProfile();
  const [stats, myQuestions, myAnswers] = await Promise.all([
    getContributionStats(profile.id),
    listMyQuestions(profile.id, 5),
    listMyAnswers(profile.id, 5),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col items-center pt-4 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-surface text-4xl shadow-sm ring-1 ring-line">
          {profile.avatar}
        </span>
        <h1 className="mt-3 flex items-center gap-2 text-xl font-semibold text-ink">
          {profile.alias}
          {profile.isVerified && <VerifiedBadge />}
        </h1>
        {profile.isAdmin && (
          <span className="mt-1 rounded-full bg-cream px-2 py-0.5 text-xs text-muted">
            🛡️ Admin
          </span>
        )}
      </div>

      <section className="grid grid-cols-3 gap-3">
        <Stat label="Asked" value={stats.asked} />
        <Stat label="Answered" value={stats.answered} />
        <Stat label="Helped" value={stats.helped} />
      </section>

      <section className="rounded-2xl border border-line bg-surface p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-faint">
          Your child&apos;s context
        </p>
        <dl className="space-y-2 text-sm">
          <Row label="Condition" value={conditionLabel(profile.condition) || "—"} />
          <Row
            label="Age"
            value={
              profile.childAge != null
                ? `${profile.childAge} yrs · ${ageBandLabel(ageToBand(profile.childAge))}`
                : "—"
            }
          />
          <Row label="City" value={profile.city || "—"} />
          <Row label="State" value={stateLabel(profile.state) || "—"} />
        </dl>
        <p className="mt-3 text-xs text-faint">
          We never store your child&apos;s name — only age and condition.
        </p>
      </section>

      <PushOptIn persistent />

      <section className="rounded-2xl border border-line bg-surface p-4 text-sm text-muted">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">
          Your privacy
        </p>
        <p>
          You&apos;re known only by your alias and avatar. Your phone/email are
          used only to sign in and are never shown to anyone. We may use
          conversations in <b>anonymised</b> form to improve Alongsyd — never in a
          way that identifies you or your family.
        </p>
      </section>

      {myQuestions.length > 0 && (
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-faint">
            Your questions
          </p>
          <div className="space-y-2">
            {myQuestions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
        </section>
      )}

      {myAnswers.length > 0 && (
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-faint">
            Your answers
          </p>
          <div className="space-y-2">
            {myAnswers.map((a) => (
              <Link
                key={a.id}
                href={a.question ? `/ask/${a.question.id}` : "/ask"}
                className="block rounded-2xl border border-line bg-surface p-4"
              >
                <p className="text-sm text-ink">
                  {a.body.length > 140 ? `${a.body.slice(0, 140)}…` : a.body}
                </p>
                <p className="mt-1.5 text-xs text-faint">
                  on “{a.question?.title ?? "a question"}”
                  {a.helpedCount > 0 && ` · ${a.helpedCount} found it helpful`}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-line bg-surface p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-faint">
          Legal &amp; help
        </p>
        <nav className="divide-y divide-line text-sm">
          {[
            { href: "/about", label: "About Alongsyd" },
            { href: "/privacy", label: "Privacy Policy" },
            { href: "/terms", label: "Terms of Service" },
            { href: "/contact", label: "Contact us" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center justify-between py-2.5 text-ink first:pt-0 last:pb-0"
            >
              {l.label}
              <span aria-hidden className="text-faint">
                ›
              </span>
            </Link>
          ))}
        </nav>
      </section>

      <form action={signOut}>
        <button
          type="submit"
          className="w-full rounded-xl border border-line bg-surface py-3 font-medium text-muted"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-3 py-4 text-center">
      <p className="text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  );
}
