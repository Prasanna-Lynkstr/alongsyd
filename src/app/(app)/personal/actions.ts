"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/engine/supabase/server";

/**
 * Personal-state mutations: bookmarks, document checklist ticks, question
 * follows, and marking notifications read. All own-row writes (RLS enforces
 * auth.uid() = user_id) and all best-effort so a pre-migration state can't
 * throw. Each toggle returns the resulting boolean for optimistic clients.
 */

async function ctx() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

export async function toggleSaveScheme(schemeId: string): Promise<boolean> {
  const { supabase, userId } = await ctx();
  if (!userId) return false;
  try {
    const { data } = await supabase
      .from("saved_schemes")
      .select("scheme_id")
      .eq("user_id", userId)
      .eq("scheme_id", schemeId)
      .maybeSingle();
    if (data) {
      await supabase
        .from("saved_schemes")
        .delete()
        .eq("user_id", userId)
        .eq("scheme_id", schemeId);
      revalidatePath("/schemes");
      return false;
    }
    await supabase
      .from("saved_schemes")
      .insert({ user_id: userId, scheme_id: schemeId });
    revalidatePath("/schemes");
    return true;
  } catch {
    return false;
  }
}

export async function getMyDocChecks(schemeId: string): Promise<number[]> {
  const { supabase, userId } = await ctx();
  if (!userId) return [];
  try {
    const { data } = await supabase
      .from("scheme_doc_checks")
      .select("doc_index")
      .eq("user_id", userId)
      .eq("scheme_id", schemeId);
    return ((data ?? []) as { doc_index: number }[]).map((r) => r.doc_index);
  } catch {
    return [];
  }
}

export async function toggleSchemeDoc(
  schemeId: string,
  docIndex: number,
): Promise<boolean> {
  const { supabase, userId } = await ctx();
  if (!userId) return false;
  try {
    const { data } = await supabase
      .from("scheme_doc_checks")
      .select("doc_index")
      .eq("user_id", userId)
      .eq("scheme_id", schemeId)
      .eq("doc_index", docIndex)
      .maybeSingle();
    if (data) {
      await supabase
        .from("scheme_doc_checks")
        .delete()
        .eq("user_id", userId)
        .eq("scheme_id", schemeId)
        .eq("doc_index", docIndex);
      return false;
    }
    await supabase
      .from("scheme_doc_checks")
      .insert({ user_id: userId, scheme_id: schemeId, doc_index: docIndex });
    return true;
  } catch {
    return false;
  }
}

export async function toggleSaveQuestion(questionId: string): Promise<boolean> {
  const { supabase, userId } = await ctx();
  if (!userId) return false;
  try {
    const { data } = await supabase
      .from("saved_questions")
      .select("question_id")
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .maybeSingle();
    if (data) {
      await supabase
        .from("saved_questions")
        .delete()
        .eq("user_id", userId)
        .eq("question_id", questionId);
      revalidatePath(`/ask/${questionId}`);
      return false;
    }
    await supabase
      .from("saved_questions")
      .insert({ user_id: userId, question_id: questionId });
    revalidatePath(`/ask/${questionId}`);
    return true;
  } catch {
    return false;
  }
}

export async function toggleFollow(questionId: string): Promise<boolean> {
  const { supabase, userId } = await ctx();
  if (!userId) return false;
  try {
    const { data } = await supabase
      .from("question_follows")
      .select("question_id")
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .maybeSingle();
    if (data) {
      await supabase
        .from("question_follows")
        .delete()
        .eq("user_id", userId)
        .eq("question_id", questionId);
      revalidatePath(`/ask/${questionId}`);
      return false;
    }
    await supabase
      .from("question_follows")
      .insert({ user_id: userId, question_id: questionId });
    revalidatePath(`/ask/${questionId}`);
    return true;
  } catch {
    return false;
  }
}

export async function markNotificationsRead(): Promise<void> {
  const { supabase, userId } = await ctx();
  if (!userId) return;
  try {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    revalidatePath("/me");
  } catch {
    // no-op pre-migration
  }
}
