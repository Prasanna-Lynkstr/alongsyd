"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  endPlatformSession,
  isPlatformAuthed,
  keyMatches,
  startPlatformSession,
} from "@/engine/platform-auth";
import * as mod from "@/engine/moderation-actions";

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

/** Bounce non-owners out before any write. */
async function requirePlatform(): Promise<void> {
  if (!(await isPlatformAuthed())) redirect("/platform");
}

export async function moderateRemoveContent(formData: FormData): Promise<void> {
  await requirePlatform();
  await mod.removeContent(
    String(formData.get("type") ?? ""),
    String(formData.get("id") ?? ""),
  );
  revalidatePath("/platform");
}

export async function moderateDeleteContent(formData: FormData): Promise<void> {
  await requirePlatform();
  await mod.deleteContent(
    String(formData.get("type") ?? ""),
    String(formData.get("id") ?? ""),
  );
  // A hard-deleted target leaves an orphan report; clear it from the queue too.
  const reportId = String(formData.get("reportId") ?? "");
  if (reportId) await mod.resolveReport(reportId);
  revalidatePath("/platform");
}

export async function moderateDeleteById(formData: FormData): Promise<void> {
  await requirePlatform();
  const type = String(formData.get("type") ?? "");
  // Accept a bare id or a pasted /ask/<id> URL — pull the UUID out either way.
  const raw = String(formData.get("id") ?? "");
  const uuid = raw.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  );
  await mod.deleteContent(type, uuid ? uuid[0] : raw.trim());
  revalidatePath("/platform");
}

export async function moderateResolveReport(formData: FormData): Promise<void> {
  await requirePlatform();
  await mod.resolveReport(String(formData.get("id") ?? ""));
  revalidatePath("/platform");
}

export async function moderateResolveFlag(formData: FormData): Promise<void> {
  await requirePlatform();
  await mod.resolveFlag(String(formData.get("id") ?? ""));
  revalidatePath("/platform");
}

export async function moderateSetVerified(formData: FormData): Promise<void> {
  await requirePlatform();
  await mod.setVerified(
    String(formData.get("userId") ?? ""),
    String(formData.get("verified") ?? "") === "true",
  );
  revalidatePath("/platform");
}
