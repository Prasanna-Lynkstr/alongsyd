import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOnboardedProfile } from "@/engine/auth";
import { findRelatedQuestions, getAnswers, getQuestion } from "@/engine/queries";
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
import PushOptIn from "@/components/PushOptIn";

export const dynamic = "force-dynamic";

export default async function QuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ posted?: string }>;
}) {
  await requireOnboardedProfile();
  const { id } = await params;
  const { posted } = await searchParams;

  const question = await getQuestion(id);
  if (!question || question.isRemoved) notFound();

  const answers = await getAnswers(id);
  // When nothing's answered yet, don't leave the parent staring at a void —
  // surface similar questions the community has already engaged with.
  const related =
    answers.length === 0
      ? await findRelatedQuestions(question.title, question.id)
      : [];

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
          <span className="text-xs text-faint">{timeAgo(question.createdAt)}</span>
        </div>
        <div className="mt-2">
          <ReportButton targetType="question" targetId={question.id} questionId={question.id} />
        </div>
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

      {/* No answers yet → point to questions the community has already tackled. */}
      {answers.length === 0 && related.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-faint">
            While you wait — similar questions
          </h2>
          {related.map((r) => (
            <QuestionCard key={r.id} question={r} />
          ))}
        </section>
      )}

      {/* Compose */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-faint">
          Share what worked for you
        </h2>
        <AnswerComposer questionId={question.id} />
      </section>
    </div>
  );
}
