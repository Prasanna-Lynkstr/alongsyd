import "server-only";
import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";
import { sendPushToUser } from "./push";
import type { AppNotification } from "./types";

type Row = Record<string, unknown>;

export type NotificationKind = "answer" | "helpful" | "digest" | "reminder";

/**
 * Record an in-app notification AND fire a Web Push for the same event. The
 * persisted row (written with the service-role key, bypassing RLS) is the inbox
 * copy a parent can return to; push is the live nudge. Persisting is best-effort
 * so a missing table pre-migration can't break the action that triggered it.
 */
export async function notifyUser(
  userId: string | null | undefined,
  n: {
    kind: NotificationKind;
    title: string;
    body: string;
    url?: string;
    tag?: string;
  },
): Promise<void> {
  if (!userId) return;
  try {
    const admin = createAdminClient();
    await admin.from("notifications").insert({
      user_id: userId,
      kind: n.kind,
      title: n.title,
      body: n.body,
      url: n.url ?? null,
    });
  } catch {
    // table may not exist yet — the push below still goes out
  }
  await sendPushToUser(userId, {
    title: n.title,
    body: n.body,
    url: n.url,
    tag: n.tag,
  });
}

/** A parent's own notifications, newest first (best-effort). */
export async function listNotifications(
  userId: string,
  limit = 20,
): Promise<AppNotification[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    return ((data ?? []) as Row[]).map((r) => ({
      id: r.id as string,
      kind: r.kind as string,
      title: r.title as string,
      body: (r.body as string) ?? "",
      url: (r.url as string) ?? null,
      isRead: Boolean(r.is_read),
      createdAt: (r.created_at as string) ?? "",
    }));
  } catch {
    return [];
  }
}
