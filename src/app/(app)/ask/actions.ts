"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/engine/supabase/server";
import { createAdminClient } from "@/engine/supabase/admin";
import { deriveTags } from "@/engine/tagging";
import { embed, toVectorLiteral } from "@/engine/embeddings";
import { notifyUser } from "@/engine/notify";
import { FEED_PAGE_SIZE, listQuestions } from "@/engine/queries";
import type { Question } from "@/engine/types";

/** Next page of the browse feed (keyset "load more"). */
export async function fetchMoreQuestions(
  filter: {
    condition?: string;
    topic?: string;
    state?: string;
    unanswered?: boolean;
  },
  before: string,
): Promise<Question[]> {
  return listQuestions(
    {
      condition: filter.condition,
      topic: filter.topic,
      state: filter.state,
      unanswered: filter.unanswered,
    },
    FEED_PAGE_SIZE,
    before,
  );
}

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
  redirect(`/ask/${data!.id}?posted=1`);
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

  // Notify the asker + everyone following this question (best-effort; never
  // blocks posting, and we never ping the parent who just answered).
  const { data: question } = await supabase
    .from("questions")
    .select("author_id, title")
    .eq("id", questionId)
    .maybeSingle();

  let followerIds: string[] = [];
  try {
    const admin = createAdminClient();
    const { data: followers } = await admin
      .from("question_follows")
      .select("user_id")
      .eq("question_id", questionId);
    followerIds = (followers ?? []).map(
      (f) => (f as { user_id: string }).user_id,
    );
  } catch {
    // question_follows may not exist pre-migration
  }

  const asker = question?.author_id ?? null;
  const notified = new Set<string>();
  if (asker && asker !== user.id) {
    notified.add(asker);
    await notifyUser(asker, {
      kind: "answer",
      title: "A parent answered your question 💬",
      body: question?.title ?? "",
      url: `/ask/${questionId}`,
      tag: `q-${questionId}`,
    });
  }
  await Promise.all(
    followerIds
      .filter((uid) => uid !== user.id && !notified.has(uid))
      .map((uid) =>
        notifyUser(uid, {
          kind: "answer",
          title: "New answer on a question you follow 💬",
          body: question?.title ?? "",
          url: `/ask/${questionId}`,
          tag: `q-${questionId}`,
        }),
      ),
  );

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

    // Tell the answer's author their words helped someone — the supply side of
    // the community gets almost no feedback otherwise. Best-effort; never self.
    const { data: answer } = await supabase
      .from("answers")
      .select("author_id")
      .eq("id", answerId)
      .maybeSingle();
    if (answer?.author_id && answer.author_id !== user.id) {
      const { data: q } = await supabase
        .from("questions")
        .select("title")
        .eq("id", questionId)
        .maybeSingle();
      await notifyUser(answer.author_id, {
        kind: "helpful",
        title: "Your answer helped a parent 💚",
        body: q?.title ?? "A parent found your answer helpful.",
        url: `/ask/${questionId}`,
        tag: `helpful-${answerId}`,
      });
    }
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
