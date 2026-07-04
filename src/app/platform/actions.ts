"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  endPlatformSession,
  isPlatformAuthed,
  keyMatches,
  startPlatformSession,
} from "@/engine/platform-auth";
import { createAdminClient } from "@/engine/supabase/admin";

/** Verify the entered key; on match, open a session, else bounce back with an error. */
export async function signInPlatform(formData: FormData): Promise<void> {
  const key = String(formData.get("key") ?? "");
  if (keyMatches(key)) {
    await startPlatformSession();
    redirect("/platform");
  }
  redirect("/platform?error=1");
}

export async function signOutPlatform(): Promise<void> {
  await endPlatformSession();
  redirect("/platform");
}

/* ── moderation, gated by the platform session (not the in-app admin role) ── */

const CONTENT_TABLES = {
  question: "questions",
  answer: "answers",
  scheme_note: "scheme_notes",
} as const;

/** Bounce non-owners out before any write. */
async function requirePlatform(): Promise<void> {
  if (!(await isPlatformAuthed())) redirect("/platform");
}

/** Soft-remove reported content (keeps the row for audit). */
export async function moderateRemoveContent(formData: FormData): Promise<void> {
  await requirePlatform();
  const type = String(formData.get("type") ?? "") as keyof typeof CONTENT_TABLES;
  const id = String(formData.get("id") ?? "");
  const table = CONTENT_TABLES[type];
  if (!table || !id) return;
  await createAdminClient().from(table).update({ is_removed: true }).eq("id", id);
  revalidatePath("/platform");
}

export async function moderateResolveReport(formData: FormData): Promise<void> {
  await requirePlatform();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await createAdminClient().from("reports").update({ resolved: true }).eq("id", id);
  revalidatePath("/platform");
}

export async function moderateResolveFlag(formData: FormData): Promise<void> {
  await requirePlatform();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await createAdminClient()
    .from("scheme_flags")
    .update({ resolved: true })
    .eq("id", id);
  revalidatePath("/platform");
}

/** Grant / revoke the verified-parent badge. */
export async function moderateSetVerified(formData: FormData): Promise<void> {
  await requirePlatform();
  const userId = String(formData.get("userId") ?? "");
  const verified = String(formData.get("verified") ?? "") === "true";
  if (!userId) return;
  await createAdminClient()
    .from("profiles")
    .update({ is_verified: verified })
    .eq("id", userId);
  revalidatePath("/platform");
}
