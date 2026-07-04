"use server";

import { redirect } from "next/navigation";
import {
  endPlatformSession,
  keyMatches,
  startPlatformSession,
} from "@/engine/platform-auth";

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
