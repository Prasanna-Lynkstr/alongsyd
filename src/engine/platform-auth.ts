import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Platform-owner gate — deliberately separate from the in-app moderator role
 * (`profiles.is_admin`). A single secret in PLATFORM_ADMIN_KEY unlocks the
 * /platform analytics dashboard WITHOUT a Supabase login, so the app owner can
 * check the pulse from any device without provisioning a parent account.
 *
 * The raw secret never lands in the browser: on sign-in we store a SHA-256
 * token derived from it, and every check compares in constant time.
 */
const KEY = process.env.PLATFORM_ADMIN_KEY ?? "";
const COOKIE = "platform_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours

/** Whether a platform key is configured at all (dashboard is hidden if not). */
export const isPlatformConfigured = Boolean(KEY);

function sessionToken(): string {
  return crypto
    .createHash("sha256")
    .update(`alongsyd/platform/${KEY}`)
    .digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/** True if the supplied key matches the configured secret (constant-time). */
export function keyMatches(input: string): boolean {
  return isPlatformConfigured && safeEqual(input, KEY);
}

/** True if the current request carries a valid platform session cookie. */
export async function isPlatformAuthed(): Promise<boolean> {
  if (!isPlatformConfigured) return false;
  const jar = await cookies();
  const val = jar.get(COOKIE)?.value;
  return Boolean(val) && safeEqual(val as string, sessionToken());
}

/** Set the httpOnly session cookie after a verified key. */
export async function startPlatformSession(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/platform",
    maxAge: MAX_AGE,
  });
}

export async function endPlatformSession(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, "", { path: "/platform", maxAge: 0 });
}
