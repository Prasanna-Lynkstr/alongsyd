"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/engine/auth";
import { createAdminClient } from "@/engine/supabase/admin";

const CONTENT_TABLES = {
  question: "questions",
  answer: "answers",
  scheme_note: "scheme_notes",
} as const;

/** Mark a user as a verified expert / veteran parent (or un-verify). */
export async function setVerified(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const verified = String(formData.get("verified") ?? "") === "true";
  if (!userId) return;
  const admin = createAdminClient();
  await admin.from("profiles").update({ is_verified: verified }).eq("id", userId);
  revalidatePath("/admin");
}

/** Remove harmful content (soft delete — keeps the row for audit). */
export async function removeContent(formData: FormData) {
  await requireAdmin();
  const type = String(formData.get("type") ?? "") as keyof typeof CONTENT_TABLES;
  const id = String(formData.get("id") ?? "");
  const table = CONTENT_TABLES[type];
  if (!table || !id) return;
  const admin = createAdminClient();
  await admin.from(table).update({ is_removed: true }).eq("id", id);
  revalidatePath("/admin");
}

export async function resolveReport(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const admin = createAdminClient();
  await admin.from("reports").update({ resolved: true }).eq("id", id);
  revalidatePath("/admin");
}

export async function resolveFlag(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const admin = createAdminClient();
  await admin.from("scheme_flags").update({ resolved: true }).eq("id", id);
  revalidatePath("/admin");
}
