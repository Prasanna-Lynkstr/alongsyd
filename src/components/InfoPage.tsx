import type { ReactNode } from "react";
import Link from "next/link";
import Brand from "@/components/Brand";
import SiteFooter from "@/components/SiteFooter";
import { getUser } from "@/engine/auth";
import { isSupabaseConfigured } from "@/engine/supabase/env";

/**
 * Shell for the static public pages (About, Privacy, Terms, Contact). Mirrors
 * the /schemes chrome: a sign-in-aware brand header, a prose column, and the
 * shared footer. Keeps every info page down to just its content.
 */
export default async function InfoPage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: string;
  /** Optional "Last updated …" line for legal pages. */
  updated?: string;
  children: ReactNode;
}) {
  const signedIn = isSupabaseConfigured && Boolean(await getUser());

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 pb-16">
      <header className="flex items-center justify-between py-3">
        <Brand size="sm" withTagline href={signedIn ? "/ask" : "/"} />
        <Link
          href={signedIn ? "/ask" : "/login"}
          className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-teal-strong"
        >
          {signedIn ? "Community →" : "Sign in"}
        </Link>
      </header>

      <article className="mt-3">
        <h1 className="text-2xl font-semibold text-ink">{title}</h1>
        {intro && <p className="mt-2 text-sm leading-relaxed text-muted">{intro}</p>}
        {updated && (
          <p className="mt-2 text-xs text-faint">Last updated {updated}</p>
        )}
        <div className="mt-6 space-y-6">{children}</div>
      </article>

      <SiteFooter />
    </main>
  );
}

/** A titled prose block used inside InfoPage content. */
export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-muted">
        {children}
      </div>
    </section>
  );
}
