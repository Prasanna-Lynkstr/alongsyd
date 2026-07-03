import type { ReactNode } from "react";
import type { PublicAuthor } from "@/engine/types";

/** A small rounded tag chip. */
export function Chip({
  children,
  tone = "soft",
}: {
  children: ReactNode;
  tone?: "soft" | "teal" | "amber";
}) {
  const tones = {
    soft: "bg-cream text-muted border-line",
    teal: "bg-teal-soft text-teal-strong border-transparent",
    amber: "bg-amber-soft text-amber border-transparent",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** The "verified" badge for experts / veteran parents. */
export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-teal-soft px-2 py-0.5 text-[11px] font-semibold text-teal-strong">
      <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor" aria-hidden>
        <path d="M10 1.6l2.2 1.6 2.7-.2 1 2.5 2.3 1.4-.9 2.6.9 2.6-2.3 1.4-1 2.5-2.7-.2L10 18.4l-2.2-1.6-2.7.2-1-2.5-2.3-1.4.9-2.6-.9-2.6 2.3-1.4 1-2.5 2.7.2L10 1.6z" />
        <path d="M8.6 12.3L6.4 10l1-1 1.2 1.2 3-3 1 1-4 4z" fill="#fff" />
      </svg>
      Verified
    </span>
  );
}

/** A parent's avatar + alias. Never shows anything private. */
export function AuthorTag({
  author,
  size = "sm",
}: {
  author: PublicAuthor | null;
  size?: "sm" | "md";
}) {
  const alias = author?.alias || "A parent";
  const avatar = author?.avatar || "🙂";
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className={`grid place-items-center rounded-full bg-cream ${size === "md" ? "h-9 w-9 text-xl" : "h-7 w-7 text-base"}`}
      >
        {avatar}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className={`font-medium text-ink ${size === "md" ? "" : "text-sm"}`}>
          {alias}
        </span>
        {author?.isVerified && <VerifiedBadge />}
      </span>
    </span>
  );
}

/** A soft empty-state block. */
export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface/60 px-5 py-10 text-center">
      <p className="font-medium text-ink">{title}</p>
      {children && <p className="mt-1 text-sm text-muted">{children}</p>}
    </div>
  );
}

/** Turn an ISO timestamp into a gentle "3 days ago" string. */
export function timeAgo(iso: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const secs = Math.max(1, Math.floor((Date.now() - then) / 1000));
  const units: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [7, "d"],
    [4.35, "w"],
    [12, "mo"],
    [Number.POSITIVE_INFINITY, "y"],
  ];
  let value = secs;
  let unit = "s";
  for (const [step, label] of units) {
    if (value < step) {
      unit = label;
      break;
    }
    value = Math.floor(value / step);
    unit = label;
  }
  if (unit === "s") return "just now";
  return `${value}${unit} ago`;
}
