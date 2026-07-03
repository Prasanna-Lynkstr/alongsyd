import "server-only";
import webpush from "web-push";
import { createAdminClient } from "./supabase/admin";

/**
 * Web Push sending (server-only). Degrades gracefully: if VAPID keys aren't set,
 * isPushConfigured is false and sends are no-ops, so the app runs fine without
 * push configured.
 */

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:noreply@alongsyd.app";

export const isPushConfigured = Boolean(VAPID_PUBLIC && VAPID_PRIVATE);

if (isPushConfigured) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

export type PushPayload = {
  title: string;
  body: string;
  /** in-app path opened when the notification is tapped */
  url?: string;
  /** collapse key so repeat notifications replace rather than stack */
  tag?: string;
};

/**
 * Send a notification to every device a user has subscribed. Best-effort: dead
 * subscriptions (404/410) are pruned; other failures are logged, never thrown,
 * so a push failure can't break the action that triggered it.
 */
export async function sendPushToUser(
  userId: string | null | undefined,
  payload: PushPayload,
): Promise<void> {
  if (!isPushConfigured || !userId) return;

  const admin = createAdminClient();
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id, subscription")
    .eq("user_id", userId);
  if (!subs || subs.length === 0) return;

  const body = JSON.stringify(payload);
  await Promise.all(
    subs.map(async (row) => {
      try {
        await webpush.sendNotification(
          row.subscription as webpush.PushSubscription,
          body,
        );
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await admin.from("push_subscriptions").delete().eq("id", row.id);
        } else {
          console.error("[push] send failed", statusCode ?? err);
        }
      }
    }),
  );
}
