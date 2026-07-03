"use client";

import { useRouter } from "next/navigation";
import { CONDITIONS, TOPICS } from "@/config/taxonomy";

/**
 * Horizontal, scrollable tag filters for the feed. Selecting a chip sets the
 * URL query (?condition= / ?topic=); selecting the active one clears it.
 */
export default function FeedFilters({
  condition,
  topic,
}: {
  condition?: string;
  topic?: string;
}) {
  const router = useRouter();

  function apply(next: { condition?: string; topic?: string }) {
    const params = new URLSearchParams();
    const c = "condition" in next ? next.condition : condition;
    const t = "topic" in next ? next.topic : topic;
    if (c) params.set("condition", c);
    if (t) params.set("topic", t);
    const qs = params.toString();
    router.push(qs ? `/ask?${qs}` : "/ask");
  }

  return (
    <div className="-mx-4 space-y-2 px-4">
      <Row>
        <FilterChip active={!condition} onClick={() => apply({ condition: undefined })}>
          All children
        </FilterChip>
        {CONDITIONS.map((c) => (
          <FilterChip
            key={c.value}
            active={condition === c.value}
            onClick={() =>
              apply({ condition: condition === c.value ? undefined : c.value })
            }
          >
            {c.icon} {c.label}
          </FilterChip>
        ))}
      </Row>
      <Row>
        <FilterChip active={!topic} onClick={() => apply({ topic: undefined })}>
          All topics
        </FilterChip>
        {TOPICS.map((t) => (
          <FilterChip
            key={t.value}
            active={topic === t.value}
            onClick={() => apply({ topic: topic === t.value ? undefined : t.value })}
          >
            {t.label}
          </FilterChip>
        ))}
      </Row>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-none whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-transparent bg-teal text-surface"
          : "border-line bg-surface text-muted"
      }`}
    >
      {children}
    </button>
  );
}
