"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: string; match: (p: string) => boolean };

const ITEMS: Item[] = [
  { href: "/ask", label: "Ask", icon: "💬", match: (p) => p === "/ask" || p.startsWith("/ask/") },
  { href: "/schemes", label: "Benefits", icon: "🗂️", match: (p) => p.startsWith("/schemes") },
  { href: "/me", label: "You", icon: "🙂", match: (p) => p.startsWith("/me") },
];

/** Fixed bottom tab bar for the signed-in app surfaces. Mobile only — the
 *  desktop counterpart is <SideNav>, so this hides at lg+. */
export default function BottomNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname() ?? "";
  const items = isAdmin
    ? [...ITEMS, { href: "/admin", label: "Admin", icon: "🛡️", match: (p: string) => p.startsWith("/admin") }]
    : ITEMS;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur lg:hidden">
      <div
        className="mx-auto flex max-w-xl items-stretch justify-around"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                active ? "text-teal-strong" : "text-faint"
              }`}
            >
              <span className={`text-lg ${active ? "" : "opacity-70"}`} aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
