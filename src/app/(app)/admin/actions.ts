"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/engine/auth";
import * as mod from "@/engine/moderation-actions";

/**
 * In-app moderation queue actions. Gate on the admin role, delegate the write
 * to the shared engine, then revalidate this surface. The platform console
 * wraps the same engine with its own (key-based) gate.
 */

/** Mark a user as a verified expert / veteran parent (or un-verify). */
export async function setVerified(formData: FormData) {
  await requireAdmin();
  await mod.setVerified(
    String(formData.get("userId") ?? ""),
    String(formData.get("verified") ?? "") === "true",
  );
  revalidatePath("/admin");
}

/** Remove harmful content (soft delete — keeps the row for audit). */
export async function removeContent(formData: FormData) {
  await requireAdmin();
  await mod.removeContent(
    String(formData.get("type") ?? ""),
    String(formData.get("id") ?? ""),
  );
  revalidatePath("/admin");
}

export async function resolveReport(formData: FormData) {
  await requireAdmin();
  await mod.resolveReport(String(formData.get("id") ?? ""));
  revalidatePath("/admin");
}

export async function resolveFlag(formData: FormData) {
  await requireAdmin();
  await mod.resolveFlag(String(formData.get("id") ?? ""));
  revalidatePath("/admin");
}
