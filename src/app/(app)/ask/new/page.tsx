import Link from "next/link";
import { requireOnboardedProfile } from "@/engine/auth";
import QuestionComposer from "@/components/QuestionComposer";

export default async function NewQuestionPage() {
  const profile = await requireOnboardedProfile();

  return (
    <div className="space-y-5">
      <Link href="/ask" className="text-sm text-muted">
        ← Back
      </Link>
      <div>
        <h1 className="text-xl font-semibold text-ink">Ask a question</h1>
        <p className="mt-1 text-sm text-muted">
          Be specific — the more real your question, the more useful the answers.
        </p>
      </div>

      <QuestionComposer
        defaultCondition={profile.condition}
        defaultAge={profile.childAge}
      />
    </div>
  );
}
