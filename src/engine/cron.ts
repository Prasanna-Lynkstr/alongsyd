import "server-only";
import { createAdminClient } from "./supabase/admin";
import { notifyUser } from "./notify";
import { conditionLabel } from "@/config/taxonomy";
import { getScheme, renewsAnnually } from "@/config/schemes";

/**
 * Scheduled jobs, invoked by protected API routes that Supabase pg_cron calls
 * (see supabase/wave3-cron.sql). All work runs with the service-role client so
 * it can read across users; every send goes through notifyUser (inbox + push).
 */

type Row = Record<string, unknown>;
const DAY = 24 * 60 * 60 * 1000;

/** Constant-time-ish bearer check against CRON_SECRET. */
export function cronAuthorized(authHeader: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && authHeader === `Bearer ${secret}`;
}

/**
 * Weekly re-engagement: to every parent who opted into notifications, how many
 * questions in their child's condition are still waiting for an answer — a
 * gentle pull back to help (and to see the community is alive).
 */
export async function runWeeklyDigest(): Promise<{
  recipients: number;
  sent: number;
}> {
  const admin = createAdminClient();
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("user_id");
  const userIds = [
    ...new Set((subs ?? []).map((r) => (r as Row).user_id as string)),
  ];
  const since = new Date(Date.now() - 7 * DAY).toISOString();

  let sent = 0;
  for (const uid of userIds) {
    const { data: prof } = await admin
      .from("profiles")
      .select("condition")
      .eq("id", uid)
      .maybeSingle();
    const condition = (prof as Row | null)?.condition as string | undefined;

    let q = admin
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("is_removed", false)
      .eq("answer_count", 0)
      .gte("created_at", since);
    if (condition) q = q.eq("condition", condition);
    const { count } = await q;
    const n = count ?? 0;
    if (n === 0) continue;

    await notifyUser(uid, {
      kind: "digest",
      title: `${n} question${n === 1 ? "" : "s"} need a parent like you`,
      body: condition
        ? `New questions about ${conditionLabel(condition)} are still waiting for an answer.`
        : "New questions this week are still waiting for an answer.",
      url: "/ask?view=unanswered",
      tag: "digest-weekly",
    });
    sent++;
  }
  return { recipients: userIds.length, sent };
}

/**
 * Annual renewal reminders: for schemes that must be renewed each year, nudge
 * the parent ~a year after they saved it so it doesn't lapse. Deduped via
 * saved_schemes.reminded_at so it fires at most once per renewal cycle.
 */
export async function runRenewalReminders(): Promise<{
  checked: number;
  sent: number;
}> {
  const admin = createAdminClient();
  const savedCutoff = new Date(Date.now() - 330 * DAY).toISOString();
  const remindedCutoff = new Date(Date.now() - 300 * DAY).toISOString();

  const { data } = await admin
    .from("saved_schemes")
    .select("user_id, scheme_id, reminded_at")
    .lte("created_at", savedCutoff);
  const rows = (data ?? []) as Row[];

  let sent = 0;
  for (const row of rows) {
    const schemeId = row.scheme_id as string;
    const remindedAt = row.reminded_at as string | null;
    if (!renewsAnnually(schemeId)) continue;
    if (remindedAt && remindedAt > remindedCutoff) continue;
    const scheme = getScheme(schemeId);
    if (!scheme) continue;

    await notifyUser(row.user_id as string, {
      kind: "reminder",
      title: `Time to renew: ${scheme.name}`,
      body: "Many families renew this every year — check whether yours is due so it doesn't lapse.",
      url: "/schemes",
      tag: `renew-${schemeId}`,
    });
    await admin
      .from("saved_schemes")
      .update({ reminded_at: new Date().toISOString() })
      .eq("user_id", row.user_id as string)
      .eq("scheme_id", schemeId);
    sent++;
  }
  return { checked: rows.length, sent };
}
