import Link from "next/link";
import Brand from "@/components/Brand";
import BottomNav from "@/components/BottomNav";
import SchemeChecker from "@/components/SchemeChecker";
import SchemeCard from "@/components/SchemeCard";
import FlagScheme from "@/components/FlagScheme";
import { EmptyState } from "@/components/ui";
import {
  SCHEMES_DISCLAIMER,
  SCHEMES_LAST_REVIEWED,
  matchSchemes,
} from "@/config/schemes";
import type { Scheme } from "@/config/schemes";
import { conditionLabel, stateLabel } from "@/config/taxonomy";
import { COUNTRY } from "@/config/country";
import { isSupabaseConfigured } from "@/engine/supabase/env";
import { getProfile } from "@/engine/auth";
import { listSchemeNotes } from "@/engine/queries";
import { getAllDocChecks, listSavedSchemes } from "@/engine/saved";
import SaveSchemeButton from "@/components/SaveSchemeButton";
import type { Profile, SchemeNote } from "@/engine/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Benefits",
};

export default async function SchemesPage({
  searchParams,
}: {
  searchParams: Promise<{ condition?: string; age?: string; state?: string }>;
}) {
  const { condition: qCond, age: qAge, state: qState } = await searchParams;
  const explicit = Boolean(qCond || qAge || qState);

  // Signed-in state + profile (best-effort — the baseline still shows if not).
  let signedIn = false;
  let profile: Profile | null = null;
  if (isSupabaseConfigured) {
    profile = await getProfile();
    signedIn = Boolean(profile);
  }

  // The app already knows this child — so when the parent hasn't typed a query,
  // pre-fill and auto-match from their profile instead of showing a blank form.
  const usingProfile =
    !explicit &&
    Boolean(
      profile && (profile.condition || profile.childAge != null || profile.state),
    );
  const condition = explicit ? (qCond ?? "") : usingProfile ? (profile!.condition ?? "") : "";
  const age = explicit
    ? (qAge ?? "")
    : usingProfile && profile!.childAge != null
      ? String(profile!.childAge)
      : "";
  const state = explicit ? (qState ?? "") : usingProfile ? (profile!.state ?? "") : "";
  const hasQuery = explicit || usingProfile;

  const ageNum = age ? Number(age) : null;
  const matches = hasQuery
    ? matchSchemes({
        condition: condition || null,
        age: Number.isFinite(ageNum as number) ? ageNum : null,
        state: state || null,
      })
    : [];

  const notesByScheme: Record<string, SchemeNote[]> = {};
  if (isSupabaseConfigured) {
    await Promise.all(
      matches.map(async (s) => {
        try {
          notesByScheme[s.id] = await listSchemeNotes(s.id, state || undefined);
        } catch {
          notesByScheme[s.id] = [];
        }
      }),
    );
  }

  // Saved schemes + document-checklist progress for the signed-in parent.
  let savedSchemes: Scheme[] = [];
  let savedIds = new Set<string>();
  let docChecks: Record<string, number[]> = {};
  if (profile) {
    const [saved, checks] = await Promise.all([
      listSavedSchemes(profile.id),
      getAllDocChecks(profile.id),
    ]);
    savedSchemes = saved;
    savedIds = new Set(saved.map((s) => s.id));
    docChecks = checks;
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 pb-24">
      {/* Public header */}
      <header className="flex items-center justify-between py-3">
        <Brand size="sm" withTagline href={signedIn ? "/ask" : null} />
        <Link
          href={signedIn ? "/ask" : "/login"}
          className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-teal-strong"
        >
          {signedIn ? "Community →" : "Sign in"}
        </Link>
      </header>

      <div className="mt-3">
        <h1 className="text-2xl font-semibold text-ink">
          What is your child entitled to?
        </h1>
        <p className="mt-2 text-sm text-muted">
          A plain-language guide to {COUNTRY.benefits.name} —{" "}
          {COUNTRY.benefits.examples} and more. No sign-in needed.
        </p>
      </div>

      {usingProfile && (
        <p className="mt-4 rounded-xl border border-teal/30 bg-teal-soft/40 px-4 py-2.5 text-sm text-teal-strong">
          ✨ Matched to your child&apos;s profile. Adjust below to explore more.
        </p>
      )}

      {savedSchemes.length > 0 && (
        <section className="mt-6 space-y-2">
          <h2 className="font-semibold text-ink">My schemes to claim</h2>
          <div className="space-y-2">
            {savedSchemes.map((s) => {
              const done = (docChecks[s.id] ?? []).length;
              const total = s.documents.length;
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {s.name}
                    </p>
                    <p className="text-xs text-faint">
                      {s.authority}
                      {total > 0 ? ` · ${done}/${total} documents ready` : ""}
                    </p>
                  </div>
                  <SaveSchemeButton schemeId={s.id} initialSaved />
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-5">
        <SchemeChecker condition={condition} age={age} state={state} />
      </div>

      {hasQuery && (
        <section className="mt-6 space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-semibold text-ink">
              {matches.length} scheme{matches.length === 1 ? "" : "s"} for{" "}
              {condition ? conditionLabel(condition) : "any condition"}
              {state ? `, ${stateLabel(state)}` : ""}
            </h2>
          </div>

          <p className="rounded-xl border border-line bg-cream px-4 py-3 text-xs text-muted">
            ⚠️ {SCHEMES_DISCLAIMER}{" "}
            {SCHEMES_LAST_REVIEWED && (
              <span className="text-faint">
                (Baseline last reviewed {SCHEMES_LAST_REVIEWED}.)
              </span>
            )}
          </p>

          {matches.length === 0 ? (
            <EmptyState title="Nothing matched those details">
              Try widening the filters — or tell us what we&apos;re missing below.
            </EmptyState>
          ) : (
            matches.map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                notes={notesByScheme[scheme.id] ?? []}
                state={state}
                signedIn={signedIn}
                saved={savedIds.has(scheme.id)}
                docChecks={docChecks[scheme.id] ?? []}
              />
            ))
          )}

          <div className="rounded-2xl border border-dashed border-line bg-surface p-4">
            <p className="text-sm font-medium text-ink">
              Something missing for {state ? stateLabel(state) : "your state"}?
            </p>
            <p className="mt-0.5 mb-2 text-xs text-muted">
              Flag it and our reviewers will confirm and add it.
            </p>
            <FlagScheme state={state} signedIn={signedIn} />
          </div>

          {/* Ends with a signup prompt */}
          {!signedIn && (
            <div className="rounded-2xl bg-teal p-5 text-surface">
              <p className="text-lg font-semibold">
                You don&apos;t have to figure this out alone.
              </p>
              <p className="mt-1 text-sm text-surface/90">
                Join Alongsyd to ask parents who&apos;ve claimed these, and add
                what worked for you.
              </p>
              <Link
                href="/login"
                className="mt-3 inline-block rounded-xl bg-surface px-4 py-2.5 text-sm font-semibold text-teal-strong"
              >
                Join the community →
              </Link>
            </div>
          )}
        </section>
      )}

      {!hasQuery && (
        <p className="mt-8 text-center text-sm text-faint">
          Pick a condition, age, or state above to begin.
        </p>
      )}

      {/* Signed-in parents keep the app tab bar here (no dead-end on mobile). */}
      {signedIn && <BottomNav isAdmin={profile?.isAdmin ?? false} />}
    </main>
  );
}
