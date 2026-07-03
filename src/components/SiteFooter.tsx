import Link from "next/link";
import { ORG } from "@/config/org";

/** Shared footer for public surfaces: the standard trust/legal links. */
export default function SiteFooter() {
  const links = [
    { href: "/about", label: "About" },
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/contact", label: "Contact" },
    { href: "/schemes", label: "Check entitlements" },
  ];

  return (
    <footer className="mt-12 border-t border-line pt-6">
      <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-ink">
            {l.label}
          </Link>
        ))}
      </nav>
      <p className="mt-4 text-xs text-faint">
        © {ORG.year} {ORG.name} · a {ORG.operator} project
      </p>
    </footer>
  );
}
