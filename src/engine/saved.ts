import "server-only";
import { createClient } from "./supabase/server";
import { getScheme, type Scheme } from "@/config/schemes";

/**
 * Reads for saved items, document checklists, and question follows.
 *
 * Every read is best-effort: until the `saved-and-notifications.sql` migration
 * is applied these tables don't exist, so we swallow the error and return an
 * empty result rather than 500 the page. Same after it's applied — a transient
 * failure just shows nothing saved, never breaks the surface.
 */

type Row = Record<string, unknown>;

/** The scheme configs a parent has bookmarked, newest first. */
export async function listSavedSchemes(userId: string): Promise<Scheme[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("saved_schemes")
      .select("scheme_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return ((data ?? []) as Row[])
      .map((r) => getScheme(r.scheme_id as string))
      .filter((s): s is Scheme => Boolean(s));
  } catch {
    return [];
  }
}

/** Map of scheme id → the document indices this parent has ticked off. */
export async function getAllDocChecks(
  userId: string,
): Promise<Record<string, number[]>> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("scheme_doc_checks")
      .select("scheme_id, doc_index")
      .eq("user_id", userId);
    const map: Record<string, number[]> = {};
    for (const r of (data ?? []) as Row[]) {
      const sid = r.scheme_id as string;
      (map[sid] ??= []).push(r.doc_index as number);
    }
    return map;
  } catch {
    return {};
  }
}

export async function isSavedQuestion(
  userId: string,
  questionId: string,
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("saved_questions")
      .select("question_id")
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}

export async function isFollowingQuestion(
  userId: string,
  questionId: string,
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("question_follows")
      .select("question_id")
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}
