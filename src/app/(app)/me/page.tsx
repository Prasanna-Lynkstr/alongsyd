import { requireOnboardedProfile } from "@/engine/auth";
import {
  ageBandLabel,
  conditionLabel,
  stateLabel,
} from "@/config/taxonomy";
import { ageToBand } from "@/config/taxonomy";
import { VerifiedBadge } from "@/components/ui";
import PushOptIn from "@/components/PushOptIn";
import { signOut } from "./actions";

export default async function MePage() {
  const profile = await requireOnboardedProfile();

  return (
    <div className="space-y-6">
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
