import Link from "next/link";
import type { Question } from "@/engine/types";
import {
  ageBandLabel,
  conditionIcon,
  conditionLabel,
  topicLabel,
} from "@/config/taxonomy";
import { Chip, timeAgo } from "@/components/ui";

/** A single question in the feed / search results. */
export default function QuestionCard({ question }: { question: Question }) {
  return (
    <Link
      href={`/ask/${question.id}`}
      className="block rounded-2xl border border-line bg-surface p-4 transition hover:border-teal/40"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {question.condition && (
          <Chip tone="teal">
            {conditionIcon(question.condition)} {conditionLabel(question.condition)}
          </Chip>
        )}
        {question.ageBand && <Chip>{ageBandLabel(question.ageBand)}</Chip>}
        {question.topic && <Chip>{topicLabel(question.topic)}</Chip>}
      </div>

      <h3 className="mt-2.5 font-semibold leading-snug text-ink">
        {question.title}
      </h3>
      {question.body && (
        <p className="mt-1 line-clamp-2 text-sm text-muted">{question.body}</p>
      )}

      <div className="mt-3 flex items-center gap-3 text-xs text-faint">
        <span>
          {question.answerCount === 0
            ? "Be the first to answer"
            : `${question.answerCount} ${question.answerCount === 1 ? "answer" : "answers"}`}
        </span>
        <span aria-hidden>·</span>
        <span>{timeAgo(question.createdAt)}</span>
      </div>
    </Link>
  );
}
