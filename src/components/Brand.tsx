import Link from "next/link";
import { TAGLINE } from "@/config/welcome";

/** The Alongsyd wordmark. `withTagline` shows the tagline under the mark. */
export default function Brand({
  size = "md",
  withTagline = false,
  href = "/ask",
}: {
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
  href?: string | null;
}) {
  const mark = (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className="grid place-items-center rounded-xl bg-teal text-surface"
        style={{
          width: size === "lg" ? 40 : size === "sm" ? 26 : 32,
          height: size === "lg" ? 40 : size === "sm" ? 26 : 32,
        }}
      >
        <svg viewBox="0 0 512 512" className="h-3/5 w-3/5" aria-hidden>
          <path
            d="M120 336 C 200 236, 312 236, 392 176"
            fill="none"
            stroke="#e9f3f0"
            strokeWidth="26"
            strokeLinecap="round"
            strokeDasharray="4 40"
          />
          <circle cx="150" cy="316" r="40" fill="#f4c95d" />
          <circle cx="362" cy="196" r="40" fill="#f4f7f5" />
        </svg>
      </span>
      <span
        className={
          "font-semibold tracking-tight text-ink " +
          (size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg")
        }
      >
        Alongsyd
      </span>
    </span>
  );

  return (
    <div className="flex flex-col">
      {href ? (
        <Link href={href} aria-label="Alongsyd home">
          {mark}
        </Link>
      ) : (
        mark
      )}
      {withTagline && (
        <span className="mt-0.5 pl-1 text-xs text-muted">{TAGLINE}</span>
      )}
    </div>
  );
}
