import "server-only";
import { createAdminClient } from "./supabase/admin";

/**
 * The moderation mutations, shared by every surface that can moderate — the
 * in-app admin queue (gated by `profiles.is_admin`) and the platform console
 * (gated by the platform key). These do the write and nothing else: no auth,
 * no cache revalidation. Each caller is responsible for gating BEFORE calling
 * and for revalidating its own path AFTER. All are no-ops on bad input.
 */

export const CONTENT_TABLES = {
  question: "questions",
  answer: "answers",
  scheme_note: "scheme_notes",
} as const;

export type ContentType = keyof typeof CONTENT_TABLES;

/** Soft-remove reported content (keeps the row for audit). */
export async function removeContent(type: string, id: string): Promise<void> {
  const table = CONTENT_TABLES[type as ContentType];
  if (!table || !id) return;
  await createAdminClient().from(table).update({ is_removed: true }).eq("id", id);
}

/** Mark a content report resolved. */
export async function resolveReport(id: string): Promise<void> {
  if (!id) return;
  await createAdminClient()
    .from("reports")
    .update({ resolved: true })
    .eq("id", id);
}

/** Mark a scheme flag reviewed. */
export async function resolveFlag(id: string): Promise<void> {
  if (!id) return;
  await createAdminClient()
    .from("scheme_flags")
    .update({ resolved: true })
    .eq("id", id);
}

/** Grant / revoke the verified-parent badge. */
export async function setVerified(
  userId: string,
  verified: boolean,
): Promise<void> {
  if (!userId) return;
  await createAdminClient()
    .from("profiles")
    .update({ is_verified: verified })
    .eq("id", userId);
}
