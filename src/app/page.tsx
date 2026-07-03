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
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <Brand size="md" href={null} withTagline />

      <div className="mt-14 flex flex-1 flex-col">
        <h1 className="text-3xl font-semibold leading-tight text-ink">
          You&apos;re not meant to walk this alone.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          Ask a real, specific question about your special-needs child — and get
          a trustworthy answer from parents who solved the same thing. Every
          question asked and answered makes Alongsyd smarter for the next family.
        </p>

        <div className="mt-8 rounded-2xl border border-line bg-surface p-4">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-wide text-faint">
            A companion for the whole journey
          </p>
          <JourneyStrip />
        </div>

        <div className="mt-auto space-y-3 pt-10">
          <Link
            href="/login"
            className="block rounded-xl bg-teal py-3.5 text-center font-semibold text-surface"
          >
            Join the community
          </Link>
          <Link
            href="/schemes"
            className="block rounded-xl border border-line bg-surface py-3.5 text-center font-semibold text-teal-strong"
          >
            Check what you&apos;re entitled to — no sign-in
          </Link>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
