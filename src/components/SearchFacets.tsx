"use client";

import { useRouter } from "next/navigation";
import { conditionIcon, conditionLabel, topicLabel } from "@/config/taxonomy";

export type Facets = {
  conditions: string[];
  cities: string[];
  topics: string[];
};
export type ActiveFacets = {
  condition?: string;
  city?: string;
  topic?: string;
};

/**
 * Hard filters for search results, faceted from the current result set — a
 * chip only appears when at least one result carries that tag. Selecting a chip
 * narrows the results; selecting the active one clears it. A dimension is shown
 * only when it has 2+ distinct values (otherwise filtering does nothing).
 */
export default function SearchFacets({
  q,
  facets,
  active,
}: {
  q: string;
  facets: Facets;
  active: ActiveFacets;
}) {
  const router = useRouter();

  function apply(next: Partial<ActiveFacets>) {
    const merged = { ...active, ...next };
    const params = new URLSearchParams();
    params.set("q", q);
    if (merged.condition) params.set("condition", merged.condition);
    if (merged.city) params.set("city", merged.city);
    if (merged.topic) params.set("topic", merged.topic);
    router.push(`/ask?${params.toString()}`);
  }

  const rows: { key: keyof ActiveFacets; label: string; options: { value: string; label: string }[] }[] = [];
  if (facets.conditions.length >= 2)
    rows.push({
      key: "condition",
      label: "Child",
      options: facets.conditions.map((c) => ({
        value: c,
        label: `${conditionIcon(c)} ${conditionLabel(c)}`,
      })),
    });
  if (facets.cities.length >= 2)
    rows.push({
      key: "city",
      label: "Where",
      options: facets.cities.map((c) => ({ value: c, label: `📍 ${c}` })),
    });
  if (facets.topics.length >= 2)
    rows.push({
      key: "topic",
      label: "Topic",
      options: facets.topics.map((t) => ({ value: t, label: topicLabel(t) })),
    });

  if (rows.length === 0) return null;

  const anyActive = active.condition || active.city || active.topic;

  return (
    <div className="space-y-2 rounded-2xl border border-line bg-surface/60 p-3">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-faint">
          Narrow results
        </span>
        {anyActive && (
          <button
            onClick={() => apply({ condition: undefined, city: undefined, topic: undefined })}
            className="text-xs font-medium text-teal-strong"
          >
            Clear all
          </button>
        )}
      </div>

      {rows.map((row) => (
        <div key={row.key} className="flex items-center gap-2">
          <span className="w-12 flex-none text-xs text-faint">{row.label}</span>
          <div className="flex flex-1 gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {row.options.map((opt) => {
              const isActive = active[row.key] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() =>
                    apply({ [row.key]: isActive ? undefined : opt.value })
                  }
                  className={`flex-none whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    isActive
                      ? "border-transparent bg-teal text-surface"
                      : "border-line bg-surface text-muted"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
