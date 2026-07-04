/**
 * Instant navigation feedback for a question page. Next.js renders this the
 * moment a parent taps a question card, so the tap feels immediate instead of
 * "stuck" while the server fetches the thread. Mirrors the real layout: back
 * link → question card → answers header → compose box.
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse space-y-5" aria-hidden>
      <div className="h-4 w-24 rounded bg-line" />

      {/* Question card */}
      <div className="space-y-3 rounded-2xl border border-line bg-surface p-5">
        <div className="flex gap-2">
          <div className="h-5 w-24 rounded-full bg-cream" />
          <div className="h-5 w-16 rounded-full bg-cream" />
        </div>
        <div className="h-6 w-3/4 rounded bg-line" />
        <div className="h-4 w-full rounded bg-cream" />
        <div className="h-4 w-5/6 rounded bg-cream" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 w-28 rounded bg-cream" />
          <div className="h-4 w-16 rounded bg-cream" />
        </div>
      </div>

      {/* Answers header + one placeholder answer */}
      <div className="h-4 w-40 rounded bg-line" />
      <div className="space-y-2 rounded-2xl border border-line bg-surface p-4">
        <div className="h-4 w-1/3 rounded bg-cream" />
        <div className="h-4 w-full rounded bg-cream" />
        <div className="h-4 w-2/3 rounded bg-cream" />
      </div>
    </div>
  );
}
