import Brand from "@/components/Brand";
import { giveConsent } from "../actions";

export default function ConsentPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-6 py-12">
      <Brand size="md" href={null} />
      <h1 className="mt-8 text-2xl font-semibold text-ink">Before you begin</h1>
      <p className="mt-2 text-sm text-muted">
        A quick note on privacy — because trust is the whole point.
      </p>

      <div className="mt-6 space-y-4">
        <ConsentPoint icon="🔒" title="Your identity stays hidden">
          You&apos;re known only by your alias and avatar. Your phone number and
          email are used to sign in — never shown to anyone.
        </ConsentPoint>
        <ConsentPoint icon="🧒" title="Your child is never named">
          We don&apos;t collect or store your child&apos;s name. Questions refer
          to a child only by age and condition.
        </ConsentPoint>
        <ConsentPoint icon="💬" title="Your messages stay private to you">
          Individual messages are yours. We may use conversations in{" "}
          <b>anonymised</b> form to understand what parents need and improve
          Alongsyd — never in a way that identifies you or your family.
        </ConsentPoint>
      </div>

      <form action={giveConsent} className="mt-8">
        <button
          type="submit"
          className="w-full rounded-xl bg-teal py-3 font-semibold text-surface"
        >
          I understand — continue
        </button>
        <p className="mt-3 text-center text-xs text-faint">
          You can read the full approach anytime in your profile.
        </p>
      </form>
    </main>
  );
}

function ConsentPoint({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-line bg-surface p-4">
      <span className="text-xl" aria-hidden>
        {icon}
      </span>
      <div>
        <p className="font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-sm text-muted">{children}</p>
      </div>
    </div>
  );
}
