"use server";

import { createClient } from "@/engine/supabase/server";

/** A browser PushSubscription serialised to JSON (what subscribe().toJSON() gives). */
export type WebPushSubscriptionJSON = {
  endpoint?: string;
  expirationTime?: number | null;
  keys?: { p256dh?: string; auth?: string };
};

/** Store (or refresh) the current user's push subscription for this device. */
export async function savePushSubscription(
  sub: WebPushSubscriptionJSON,
): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Not signed in";
  if (!sub?.endpoint) return "Invalid subscription";

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      { user_id: user.id, endpoint: sub.endpoint, subscription: sub },
      { onConflict: "endpoint" },
    );
  return error ? error.message : null;
}

/** Remove this device's subscription (parent turned notifications off). */
export async function removePushSubscription(endpoint: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !endpoint) return;
  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint)
    .eq("user_id", user.id);
}
