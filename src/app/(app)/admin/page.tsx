import Link from "next/link";
import { requireAdmin } from "@/engine/auth";
import { createAdminClient } from "@/engine/supabase/admin";
import { SUPABASE_SERVICE_ROLE_KEY } from "@/engine/supabase/env";
import { conditionLabel, stateLabel } from "@/config/taxonomy";
import { getScheme } from "@/config/schemes";
import { timeAgo } from "@/components/ui";
import {
  removeContent,
  resolveFlag,
  resolveReport,
  setVerified,
} from "./actions";

export const dynamic = "force-dynamic";

type Row = Record<string, unknown>;

export default async function AdminPage() {
  await requireAdmin();

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-5">
        <h1 className="text-lg font-semibold text-ink">Admin</h1>
        <p className="mt-2 text-sm text-muted">
          Moderation is disabled because{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code> isn&apos;t set. Add it to your
          environment (see the README) to verify users and remove content.
        </p>
      </div>
    );
  }

  const admin = createAdminClient();
  const [{ data: reports }, { data: flags }, { data: profiles }] =
    await Promise.all([
      admin
        .from("reports")
        .select("*")
        .eq("resolved", false)
        .order("created_at", { ascending: false }),
      admin
        .from("scheme_flags")
        .select("*")
        .eq("resolved", false)
        .order("created_at", { ascending: false }),
      admin
        .from("profiles")
        .select("id, alias, avatar, condition, state, is_verified, is_admin, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink">Admin</h1>
        <p className="text-sm text-muted">Keep the community safe and helpful.</p>
      </div>

      {/* Reports */}
      <Section title="Content reports" count={reports?.length ?? 0}>
        {(reports ?? []).map((r: Row) => (
          <div key={r.id as string} className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between text-xs text-faint">
              <span className="font-medium uppercase tracking-wide">
                {r.target_type as string}
              </span>
              <span>{timeAgo(r.created_at as string)}</span>
            </div>
            {(r.reason as string) && (
              <p className="mt-1 text-sm text-ink/90">“{r.reason as string}”</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <form action={removeContent}>
                <input type="hidden" name="type" value={r.target_type as string} />
                <input type="hidden" name="id" value={r.target_id as string} />
                <button className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white">
                  Remove content
                </button>
              </form>
              <form action={resolveReport}>
                <input type="hidden" name="id" value={r.id as string} />
                <button className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted">
                  Dismiss
                </button>
              </form>
            </div>
          </div>
        ))}
        {(reports?.length ?? 0) === 0 && <Empty>No open reports. </Empty>}
      </Section>

      {/* Scheme flags */}
      <Section title="Scheme flags" count={flags?.length ?? 0}>
        {(flags ?? []).map((f: Row) => (
          <div key={f.id as string} className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between text-xs text-faint">
              <span className="font-medium">
                {f.scheme_id
                  ? (getScheme(f.scheme_id as string)?.name ?? (f.scheme_id as string))
                  : "Missing scheme"}
                {f.state ? ` · ${stateLabel(f.state as string)}` : ""}
              </span>
              <span>{timeAgo(f.created_at as string)}</span>
            </div>
            {(f.note as string) && (
              <p className="mt-1 text-sm text-ink/90">“{f.note as string}”</p>
            )}
            <form action={resolveFlag} className="mt-3">
              <input type="hidden" name="id" value={f.id as string} />
              <button className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted">
                Mark reviewed
              </button>
            </form>
          </div>
        ))}
        {(flags?.length ?? 0) === 0 && <Empty>No scheme flags.</Empty>}
      </Section>

      {/* Verify users */}
      <Section title="Parents" count={profiles?.length ?? 0}>
        <p className="-mt-1 mb-2 text-xs text-muted">
          Mark trusted experts / veteran parents as verified — their answers get a
          badge.
        </p>
        <div className="space-y-2">
          {(profiles ?? []).map((p: Row) => (
            <div
              key={p.id as string}
              className="flex items-center justify-between rounded-xl border border-line bg-surface p-3"
            >
              <span className="flex items-center gap-2">
                <span className="text-xl">{p.avatar as string}</span>
                <span>
                  <span className="block text-sm font-medium text-ink">
                    {(p.alias as string) || "—"}
                    {p.is_admin ? " · 🛡️" : ""}
                  </span>
                  <span className="block text-xs text-faint">
                    {conditionLabel(p.condition as string) || "—"}
                    {p.state ? ` · ${stateLabel(p.state as string)}` : ""}
                  </span>
                </span>
              </span>
              <form action={setVerified}>
                <input type="hidden" name="userId" value={p.id as string} />
                <input
                  type="hidden"
                  name="verified"
                  value={p.is_verified ? "false" : "true"}
                />
                <button
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    p.is_verified
                      ? "border border-line text-muted"
                      : "bg-teal text-surface"
                  }`}
                >
                  {p.is_verified ? "Verified ✓ (undo)" : "Verify"}
                </button>
              </form>
            </div>
          ))}
        </div>
      </Section>

      <Link href="/ask" className="block text-center text-sm text-muted">
        ← Back to community
      </Link>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-faint">
        {title} {count > 0 && <span className="text-teal-strong">({count})</span>}
      </h2>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}
