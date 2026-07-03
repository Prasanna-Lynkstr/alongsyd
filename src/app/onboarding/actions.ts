"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/engine/supabase/server";

/** Save the safe second identity + child context, then move to consent. */
export async function saveProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const alias = String(formData.get("alias") ?? "").trim();
  const avatar = String(formData.get("avatar") ?? "🙂");
  const condition = String(formData.get("condition") ?? "") || null;
  const childAgeRaw = String(formData.get("childAge") ?? "").trim();
  const childAge = childAgeRaw ? Number(childAgeRaw) : null;
  const city = String(formData.get("city") ?? "").trim() || null;
  const state = String(formData.get("state") ?? "") || null;

  if (!alias) redirect("/onboarding/profile?error=alias");

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    alias,
    avatar,
    condition,
    child_age: Number.isFinite(childAge as number) ? childAge : null,
    city,
    state,
  });
  if (error) redirect(`/onboarding/profile?error=${encodeURIComponent(error.message)}`);

  redirect("/onboarding/consent");
}

/** Record consent, then show the one-time welcome. */
export async function giveConsent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("profiles")
    .update({ consented_at: new Date().toISOString() })
    .eq("id", user.id);

  redirect("/onboarding/welcome");
}

/** Mark the one-time welcome as seen, then enter the community. */
export async function finishWelcome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("profiles")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", user.id);

  redirect("/ask");
}
