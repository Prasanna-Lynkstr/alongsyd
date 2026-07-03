"use client";

import { useRouter } from "next/navigation";

export type FeedView = "latest" | "unanswered" | "near";

/**
 * Segmented control over how the feed is sliced: newest, questions still
 * needing answers (routes helpers to where they're useful), or near the
 * parent's own region. Preserves the active condition/topic chips.
 */
export default function FeedViews({
  view,
  condition,
  topic,
  hasRegion,
}: {
  view: FeedView;
  condition?: string;
  topic?: string;
  /** Whether the parent has a region on their profile (else hide "Near you"). */
  hasRegion: boolean;
}) {
  const router = useRouter();

  function go(next: FeedView) {
    const params = new URLSearchParams();
    if (condition) params.set("condition", condition);
    if (topic) params.set("topic", topic);
    if (next !== "latest") params.set("view", next);
    const qs = params.toString();
    router.push(qs ? `/ask?${qs}` : "/ask");
  }

  const tabs: { key: FeedView; label: string }[] = [
    { key: "latest", label: "Latest" },
    { key: "unanswered", label: "Needs answers" },
    ...(hasRegion ? [{ key: "near" as const, label: "Near you" }] : []),
  ];

  return (
    <div className="flex rounded-full bg-cream p-1 text-xs font-medium sm:text-sm">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => go(t.key)}
          className={`min-w-0 flex-1 whitespace-nowrap rounded-full px-1 py-1.5 transition ${
            view === t.key ? "bg-surface text-teal-strong shadow-sm" : "text-muted"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
