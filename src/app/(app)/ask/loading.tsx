/**
 * Instant feedback for the community feed. Shown the moment a parent opens
 * /ask (or runs a search, which does a slow semantic lookup), so the page
 * paints structure immediately instead of sitting blank. Mirrors the real
 * layout: heading → search → view tabs → a column of question cards.
 */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse space-y-4" aria-hidden>
      {/* Heading */}
      <div className="space-y-2">
        <div className="h-6 w-40 rounded bg-line" />
        <div className="h-4 w-3/4 rounded bg-cream" />
      </div>

      {/* Search bar */}
      <div className="h-12 rounded-xl border border-line bg-surface" />

      {/* View tabs */}
      <div className="flex gap-2">
        <div className="h-8 w-20 rounded-full bg-cream" />
        <div className="h-8 w-24 rounded-full bg-cream" />
        <div className="h-8 w-20 rounded-full bg-cream" />
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <FeedCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function FeedCardSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-line bg-surface p-5">
      <div className="flex gap-2">
        <div className="h-5 w-24 rounded-full bg-cream" />
        <div className="h-5 w-16 rounded-full bg-cream" />
      </div>
      <div className="h-5 w-4/5 rounded bg-line" />
      <div className="h-4 w-full rounded bg-cream" />
      <div className="flex items-center justify-between pt-1">
        <div className="h-4 w-28 rounded bg-cream" />
        <div className="h-4 w-16 rounded bg-cream" />
      </div>
    </div>
  );
}
