import Link from "next/link";
import { redirect } from "next/navigation";
import Brand from "@/components/Brand";
import JourneyStrip from "@/components/JourneyStrip";
import SiteFooter from "@/components/SiteFooter";
import { getUser } from "@/engine/auth";
import { isSupabaseConfigured } from "@/engine/supabase/env";

export const dynamic = "force-dynamic";

/** Front door. Signed-in parents skip straight into the app; everyone else
 *  meets the framing and can either sign in or check benefits without login. */
export default async function Home() {
  if (isSupabaseConfigured && (await getUser())) {
    redirect("/auth/continue");
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-6 py-10">
      <Brand size="md" href={null} />

      <h1 className="mt-10 text-3xl font-semibold leading-tight text-ink">
        Alongside you, the whole way.
      </h1>

      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted">
        <p>
          Raising a child with special needs means facing new questions at every
          stage — from the first diagnosis to school, to adulthood, and to the
          question every parent carries quietly: who cares for them after us.
        </p>
        <p>
          Alongsyd is being built to walk that whole journey with you. Over time,
          it will support you at each stage with what you actually need —
          therapists and schools in your city, planning for the years ahead,
          options for after-us, and the hard-won wisdom of parents who&apos;ve
          been there.
        </p>
        <p>
          We&apos;re starting with the thing parents ask for most: a place to ask
          questions and get real answers from others who understand.{" "}
          <b className="font-semibold text-ink">That&apos;s live today.</b> More
          will follow, shaped by what helps you most.
        </p>
        <p>
          And it gets smarter as it grows. Every question and answer, once
          anonymised, builds a shared intelligence — so the guidance becomes more
          accurate, more local, and more useful for the next parent, and the
          next.
        </p>
        <p className="font-medium text-ink">This is just the beginning.</p>
      </div>

      <div className="mt-8 space-y-3">
        <Link
          href="/login"
          className="block rounded-xl bg-teal py-3.5 text-center font-semibold text-surface"
        >
          Ask your first question
        </Link>
        <Link
          href="/schemes"
          className="block text-center text-sm font-medium text-teal-strong"
        >
          Or check what you&apos;re entitled to — no sign-in
        </Link>
      </div>

      <div className="mt-10 rounded-2xl border border-line bg-surface p-4">
        <p className="mb-4 text-center text-xs font-medium text-muted">
          What Alongsyd will grow to support — together, over time
        </p>
        <JourneyStrip />
      </div>

      <SiteFooter />
    </main>
  );
}
