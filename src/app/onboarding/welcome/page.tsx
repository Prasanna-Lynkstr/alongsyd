import Brand from "@/components/Brand";
import JourneyStrip from "@/components/JourneyStrip";
import { WELCOME } from "@/config/welcome";
import { finishWelcome } from "../actions";

/** One-time welcome. The router in /auth/continue skips this after it's seen. */
export default function WelcomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-12">
      <div className="flex flex-1 flex-col justify-center">
        <Brand size="lg" href={null} withTagline />

        <h1 className="mt-8 text-2xl font-semibold text-ink">
          {WELCOME.heading}
        </h1>
        <p className="mt-1 text-lg font-medium text-teal-strong">
          {WELCOME.lead}
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          {WELCOME.body}
        </p>

        <div className="mt-8 rounded-2xl border border-line bg-surface p-4">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-wide text-faint">
            The journey ahead
          </p>
          <JourneyStrip />
        </div>
      </div>

      <form action={finishWelcome} className="mt-8">
        <button
          type="submit"
          className="w-full rounded-xl bg-teal py-3.5 font-semibold text-surface"
        >
          {WELCOME.cta}
        </button>
      </form>
    </main>
  );
}
