/**
 * Instant feedback for the profile tab. /me fans out four DB reads (stats,
 * questions, answers, notifications) before it can render, so this skeleton
 * paints the shape — avatar → stats → context — the moment the tab is tapped.
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse space-y-6" aria-hidden>
      {/* Avatar + alias */}
      <div className="flex flex-col items-center pt-4">
        <div className="h-20 w-20 rounded-full bg-cream ring-1 ring-line" />
        <div className="mt-3 h-6 w-32 rounded bg-line" />
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-line bg-surface px-3 py-5"
          >
            <div className="mx-auto h-6 w-8 rounded bg-line" />
            <div className="mx-auto mt-2 h-3 w-12 rounded bg-cream" />
          </div>
        ))}
      </div>

      {/* Context card */}
      <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
        <div className="h-3 w-32 rounded bg-cream" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-20 rounded bg-cream" />
            <div className="h-4 w-24 rounded bg-line" />
          </div>
        ))}
      </div>

      {/* A list block (your questions) */}
      <div className="space-y-2">
        <div className="h-3 w-28 rounded bg-cream" />
        <div className="h-20 rounded-2xl border border-line bg-surface" />
        <div className="h-20 rounded-2xl border border-line bg-surface" />
      </div>
    </div>
  );
}
