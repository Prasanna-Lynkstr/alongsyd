import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./supabase/server";
import type { Profile } from "./types";

/** DB row (snake_case) → Profile (camelCase). */
export function rowToProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    alias: (row.alias as string) ?? "",
    avatar: (row.avatar as string) ?? "🙂",
    condition: (row.condition as string) ?? null,
    childAge: (row.child_age as number) ?? null,
    city: (row.city as string) ?? null,
    state: (row.state as string) ?? null,
    isVerified: Boolean(row.is_verified),
    isAdmin: Boolean(row.is_admin),
    consentedAt: (row.consented_at as string) ?? null,
    onboardedAt: (row.onboarded_at as string) ?? null,
    createdAt: (row.created_at as string) ?? "",
  };
}

/** The signed-in auth user, or null. */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** The signed-in user's profile row, or null if not signed in / no row yet. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return data ? rowToProfile(data) : null;
}

/**
 * Gate for pages that need a fully onboarded parent. Redirects (consent first,
 * so we show our privacy promise before collecting any child details):
 *  - not signed in            → /login
 *  - signed in, not consented → /onboarding/consent
 *  - consented, no alias       → /onboarding/profile
 * Returns the ready profile otherwise.
 */
export async function requireOnboardedProfile(): Promise<Profile> {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await getProfile();
  if (!profile || !profile.consentedAt) redirect("/onboarding/consent");
  if (!profile.alias) redirect("/onboarding/profile");
  return profile;
}

/** Gate for admin-only routes. Returns the admin profile or 403-style redirect. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!profile.isAdmin) redirect("/ask");
  return profile;
}
