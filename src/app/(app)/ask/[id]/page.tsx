import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOnboardedProfile } from "@/engine/auth";
import { findRelatedQuestions, getAnswers, getQuestion } from "@/engine/queries";
import { isFollowingQuestion, isSavedQuestion } from "@/engine/saved";
import { withinEditWindow } from "@/config/community";
import {
  ageBandLabel,
  conditionIcon,
  conditionLabel,
  stateLabel,
  topicLabel,
} from "@/config/taxonomy";
import { AuthorTag, Chip, timeAgo } from "@/components/ui";
import HelpfulButton from "@/components/HelpfulButton";
import ReportButton from "@/components/ReportButton";
import AnswerComposer from "@/components/AnswerComposer";
import QuestionCard from "@/components/QuestionCard";
import QuestionActions from "@/components/QuestionActions";
import QuestionOwnerActions from "@/components/QuestionOwnerActions";
import PushOptIn from "@/components/PushOptIn";

export const dynamic = "force-dynamic";

export default async function QuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ posted?: string; edited?: string }>;
}) {
  const me = await requireOnboardedProfile();
  const { id } = await params;
  const { posted, edited } = await searchParams;

  // Fetch everything the shell needs in parallel — these are all fast Supabase
  // reads. The slow bit (semantic "similar questions") is deliberately NOT here;
  // it streams in via <Suspense> below so it can't hold up the question itself.
  const [question, answers, following, saved] = await Promise.all([
    getQuestion(id),
    getAnswers(id),
    isFollowingQuestion(me.id, id),
    isSavedQuestion(me.id, id),
  ]);
  if (!question || question.isRemoved) notFound();

  // Owner controls (edit / delete) show only for the author, only inside the
  // grace window. The server actions re-check both — this is just the gate for
  // whether to render the affordance at all.
  const canManage =
    question.author?.id === me.id && withinEditWindow(question.createdAt);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/ask" className="text-sm text-muted">
        ← Community
      </Link>

      {posted && (
        <div className="space-y-3 rounded-2xl border border-teal/30 bg-teal-soft/40 p-4">
          <div>
            <p className="font-semibold text-teal-strong">
              Your question is live 🌱
            </p>
            <p className="mt-0.5 text-sm text-muted">
              Parents who&apos;ve been here will start weighing in. We&apos;ll
              notify you the moment someone answers.
            </p>
          </div>
          <PushOptIn />
        </div>
      )}

      {edited && (
        <p className="rounded-xl border border-teal/30 bg-teal-soft/40 px-4 py-2.5 text-sm text-teal-strong">
          Your changes are saved.
        </p>
      )}

      {/* Question */}
      <article className="rounded-2xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          {question.condition && (
            <Chip tone="teal">
              {conditionIcon(question.condition)}{" "}
              {conditionLabel(question.condition)}
            </Chip>
          )}
          {question.ageBand && <Chip>{ageBandLabel(question.ageBand)}</Chip>}
          {question.topic && <Chip>{topicLabel(question.topic)}</Chip>}
          {question.state && <Chip>{stateLabel(question.state)}</Chip>}
        </div>

        <h1 className="mt-3 text-xl font-semibold leading-snug text-ink">
          {question.title}
        </h1>
        {question.body && (
          <p className="mt-2 whitespace-pre-wrap text-[15px] text-ink/90">
            {question.body}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <AuthorTag author={question.author} />
          <span className="text-xs text-faint">
            {timeAgo(question.createdAt)}
            {question.editedAt && " · edited"}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <QuestionActions
            questionId={question.id}
            initialFollowing={following}
            initialSaved={saved}
          />
          <ReportButton targetType="question" targetId={question.id} questionId={question.id} />
        </div>

        {canManage && (
          <QuestionOwnerActions
            questionId={question.id}
            title={question.title}
            body={question.body}
          />
        )}
      </article>

      {/* Answers */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-faint">
          {answers.length === 0
            ? "No answers yet — be the first"
            : `${answers.length} ${answers.length === 1 ? "answer" : "answers"}`}
        </h2>

        {answers.map((answer) => (
          <article
            key={answer.id}
            className="rounded-2xl border border-line bg-surface p-4"
          >
            <div className="flex items-center justify-between">
              <AuthorTag author={answer.author} />
              <span className="text-xs text-faint">
                {timeAgo(answer.createdAt)}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-[15px] text-ink/90">
              {answer.body}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <HelpfulButton
                answerId={answer.id}
                questionId={question.id}
                count={answer.helpedCount}
                active={answer.viewerFoundHelpful}
              />
              <ReportButton
                targetType="answer"
                targetId={answer.id}
                questionId={question.id}
              />
            </div>
          </article>
        ))}
      </section>

      {/* Compose — the primary action, sits right under the answers. */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-faint">
          Share what worked for you
        </h2>
        <AnswerComposer questionId={question.id} />
      </section>

      {/* Empty threads: offer similar questions to explore. Streamed via
          Suspense so the slow semantic search never blocks the question, and
          placed last + clearly optional so it doesn't compete with answering. */}
      {answers.length === 0 && (
        <Suspense fallback={<RelatedSkeleton />}>
          <RelatedQuestions title={question.title} excludeId={question.id} />
        </Suspense>
      )}
    </div>
  );
}

/** Streamed-in "similar questions" for an as-yet-unanswered thread. */
async function RelatedQuestions({
  title,
  excludeId,
}: {
  title: string;
  excludeId: string;
}) {
  const related = await findRelatedQuestions(title, excludeId);
  if (related.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-faint">
        Not ready to answer? Browse similar questions
      </h2>
      {related.map((r) => (
        <QuestionCard key={r.id} question={r} />
      ))}
    </section>
  );
}

function RelatedSkeleton() {
  return (
    <div className="animate-pulse space-y-3" aria-hidden>
      <div className="h-4 w-56 rounded bg-line" />
      <div className="h-20 rounded-2xl border border-line bg-surface" />
      <div className="h-20 rounded-2xl border border-line bg-surface" />
    </div>
  );
}
