"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/engine/supabase/server";
import { deriveTags } from "@/engine/tagging";
import { embed, toVectorLiteral } from "@/engine/embeddings";
import { sendPushToUser } from "@/engine/push";

/** Post a new question. Auto-tags from the parent's inputs + profile defaults. */
export async function postQuestion(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title) redirect("/ask/new?error=title");

  // Pull profile defaults so a question inherits the child's context.
  const { data: profile } = await supabase
    .from("profiles")
    .select("condition, child_age, city, state")
    .eq("id", user.id)
    .maybeSingle();

  const condition =
    String(formData.get("condition") ?? "") || profile?.condition || null;
  const childAgeRaw = String(formData.get("childAge") ?? "").trim();
  const childAge = childAgeRaw ? Number(childAgeRaw) : (profile?.child_age ?? null);
  const topic = String(formData.get("topic") ?? "") || null;

  const tags = deriveTags({
    title,
    body,
    condition,
    childAge: Number.isFinite(childAge as number) ? (childAge as number) : null,
    city: profile?.city ?? null,
    state: profile?.state ?? null,
    topic,
  });

  // Embed the question for semantic search (best-effort — a failure here must
  // not block posting; the question is still keyword-searchable, and `pnpm
  // embed` can backfill it later).
  const vector = await embed(`${title}\n\n${body}`);

  const { data, error } = await supabase
    .from("questions")
    .insert({
      author_id: user.id,
      title,
      body,
      condition: tags.condition,
      age_band: tags.ageBand,
      city: tags.city,
      state: tags.state,
      topic: tags.topic,
      embedding: vector ? toVectorLiteral(vector) : null,
    })
    .select("id")
    .single();

  if (error) redirect(`/ask/new?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/ask");
  redirect(`/ask/${data!.id}`);
}

/** Post an answer to a question. */
export async function postAnswer(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const questionId = String(formData.get("questionId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!questionId || !body) redirect(`/ask/${questionId}?error=empty`);

  const { error } = await supabase.from("answers").insert({
    question_id: questionId,
    author_id: user.id,
    body,
  });
  if (error) redirect(`/ask/${questionId}?error=${encodeURIComponent(error.message)}`);

  // Notify the asker that a parent answered (best-effort; never blocks posting,
  // and we don't ping someone answering their own question).
  const { data: question } = await supabase
    .from("questions")
    .select("author_id, title")
    .eq("id", questionId)
    .maybeSingle();
  if (question?.author_id && question.author_id !== user.id) {
    await sendPushToUser(question.author_id, {
      title: "A parent answered your question 💬",
      body: question.title,
      url: `/ask/${questionId}`,
      tag: `q-${questionId}`,
    });
  }

  revalidatePath(`/ask/${questionId}`);
  revalidatePath("/ask");
}

/** Toggle a "this helped" vote for the current user on an answer. */
export async function toggleHelpful(answerId: string, questionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("helpful_votes")
    .select("answer_id")
    .eq("answer_id", answerId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("helpful_votes")
      .delete()
      .eq("answer_id", answerId)
      .eq("user_id", user.id);
  } else {
    await supabase
      .from("helpful_votes")
      .insert({ answer_id: answerId, user_id: user.id });
  }

  revalidatePath(`/ask/${questionId}`);
}

/** File a report on a piece of content → admin queue. */
export async function reportContent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const targetType = String(formData.get("targetType") ?? "");
  const targetId = String(formData.get("targetId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const questionId = String(formData.get("questionId") ?? "");

  if (["question", "answer", "scheme_note"].includes(targetType) && targetId) {
    await supabase.from("reports").insert({
      target_type: targetType,
      target_id: targetId,
      reporter_id: user.id,
      reason,
    });
  }
  if (questionId) revalidatePath(`/ask/${questionId}`);
}
