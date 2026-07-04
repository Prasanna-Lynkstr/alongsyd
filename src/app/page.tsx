import Link from "next/link";
import { redirect } from "next/navigation";
import Brand from "@/components/Brand";
import JourneyStrip from "@/components/JourneyStrip";
import SiteFooter from "@/components/SiteFooter";
import { AUDIENCE, PLANNED_SURFACES } from "@/config/welcome";
import { getUser } from "@/engine/auth";
import { isSupabaseConfigured } from "@/engine/supabase/env";

export const dynamic = "force-dynamic";

/** What's live today — the two things a parent can do right now. */
const LIVE = [
  {
    icon: "💬",
    title: "Ask & get answers",
    body: "Real questions, answered by parents who solved the same thing.",
  },
  {
    icon: "🗂️",
    title: "Know your entitlements",
    body: "A plain-language guide to schemes and benefits. No sign-in.",
  },
];

/** Front door. Signed-in parents skip straight into the app; everyone else
 *  meets the framing and can either sign in or check benefits without login. */
export default async function Home() {
  if (isSupabaseConfigured && (await getUser())) {
    redirect("/auth/continue");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-10 md:max-w-2xl">
      {/* Hero */}
      <header className="flex flex-col items-center text-center">
        <Brand size="md" href={null} />
        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-strong/90">
          {AUDIENCE}
        </p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight text-ink md:text-4xl">
          Alongside you,
          <br />
          <span className="text-teal-strong">the whole way.</span>
        </h1>
        <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
          Real answers from parents who&apos;ve been there — and everything your
          child is entitled to.
        </p>

        <div className="mt-7 flex w-full max-w-xs flex-col gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-teal py-3.5 text-center font-semibold text-surface"
          >
            Ask your first question
          </Link>
          <Link
            href="/schemes"
            className="text-center text-sm font-medium text-teal-strong"
          >
            Check benefits — no sign-in →
          </Link>
        </div>

        <p className="mt-4 text-sm text-muted">
          Already with us?{" "}
          <Link href="/login" className="font-medium text-teal-strong underline">
            Sign in
          </Link>
        </p>
      </header>

      {/* What's live today */}
      <section className="mt-12 grid gap-3 sm:grid-cols-2">
        {LIVE.map((v) => (
          <div
            key={v.title}
            className="rounded-2xl border border-line bg-surface p-4"
          >
            <div className="flex items-center justify-between">
              <span
                className="grid h-10 w-10 place-items-center rounded-xl bg-teal-soft text-xl"
                aria-hidden
              >
                {v.icon}
              </span>
              <span className="rounded-full bg-teal-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-strong">
                Live
              </span>
            </div>
            <p className="mt-3 font-semibold text-ink">{v.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{v.body}</p>
          </div>
        ))}
      </section>

      {/* Where it's headed */}
      <section className="mt-4 rounded-2xl border border-line bg-surface p-4">
        <p className="mb-4 text-center text-xs font-medium text-muted">
          Growing to walk the whole journey — together, over time
        </p>
        <JourneyStrip />

        <div className="mt-5 border-t border-line pt-4">
          <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-wide text-faint">
            On the horizon
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {PLANNED_SURFACES.map((s) => (
              <span
                key={s}
                className="rounded-full border border-line bg-cream px-3 py-1 text-xs text-muted"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      <p className="mt-8 text-center text-sm text-muted">
        <span aria-hidden>🔒</span> Anonymous by design — and smarter every time
        one parent helps another.
      </p>

      <SiteFooter />
    </main>
  );
}
