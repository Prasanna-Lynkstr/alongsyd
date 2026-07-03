"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/engine/supabase/server";

/**
 * Add a crowd note to a scheme. Author display fields are denormalised onto the
 * note so the public (no-login) page can render them without reading profiles.
 * Returns an error string, or null on success.
 */
export async function addSchemeNote(formData: FormData): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Please sign in to share your experience.";

  const schemeId = String(formData.get("schemeId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const state = String(formData.get("state") ?? "") || null;
  const district = String(formData.get("district") ?? "").trim() || null;
  if (!schemeId || !body) return "Please write a short note.";

  const { data: profile } = await supabase
    .from("profiles")
    .select("alias, avatar, is_verified, state")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("scheme_notes").insert({
    scheme_id: schemeId,
    state: state ?? profile?.state ?? null,
    district,
    author_id: user.id,
    author_alias: profile?.alias || "A parent",
    author_avatar: profile?.avatar || "🙂",
    author_verified: Boolean(profile?.is_verified),
    body,
  });
  if (error) return error.message;

  revalidatePath("/schemes");
  return null;
}

/** Flag a scheme as missing/wrong for a state → admin queue. */
export async function flagScheme(formData: FormData): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Please sign in to flag this.";

  const schemeId = String(formData.get("schemeId") ?? "") || null;
  const state = String(formData.get("state") ?? "") || null;
  const note = String(formData.get("note") ?? "").trim();

  const { error } = await supabase.from("scheme_flags").insert({
    scheme_id: schemeId,
    state,
    note,
    reporter_id: user.id,
  });
  if (error) return error.message;
  return null;
}
