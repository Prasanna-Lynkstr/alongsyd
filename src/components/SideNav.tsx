"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "@/components/Brand";

type Item = { href: string; label: string; icon: string; match: (p: string) => boolean };

const ITEMS: Item[] = [
  { href: "/ask", label: "Community", icon: "💬", match: (p) => p === "/ask" || p.startsWith("/ask/") },
  { href: "/schemes", label: "Benefits", icon: "🗂️", match: (p) => p.startsWith("/schemes") },
  { href: "/me", label: "You", icon: "🙂", match: (p) => p.startsWith("/me") },
];

/**
 * Vertical navigation for the signed-in app on desktop (lg+). The mobile
 * counterpart is the fixed <BottomNav>; only one is visible at a time.
 */
export default function SideNav({
  isAdmin = false,
  avatar = "🙂",
  alias = "You",
}: {
  isAdmin?: boolean;
  avatar?: string;
  alias?: string;
}) {
  const pathname = usePathname() ?? "";
  const items = isAdmin
    ? [...ITEMS, { href: "/admin", label: "Admin", icon: "🛡️", match: (p: string) => p.startsWith("/admin") }]
    : ITEMS;

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-1 border-r border-line px-3 py-5 lg:flex">
      <div className="px-2 pb-4">
        <Brand size="md" withTagline href="/ask" />
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-teal-soft text-teal-strong"
                  : "text-muted hover:bg-cream hover:text-ink"
              }`}
            >
              <span className="text-lg" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/ask/new"
        className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-teal px-3 py-2.5 text-sm font-semibold text-surface"
      >
        <span aria-hidden>✏️</span> Ask a question
      </Link>

      <Link
        href="/me"
        className="mt-auto flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-cream"
      >
        <span
          aria-hidden
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface text-xl shadow-sm ring-1 ring-line"
        >
          {avatar}
        </span>
        <span className="min-w-0 truncate text-sm font-medium text-ink">{alias}</span>
      </Link>
    </aside>
  );
}
