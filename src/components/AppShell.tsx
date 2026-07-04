import Link from "next/link";
import Brand from "@/components/Brand";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";

/**
 * The signed-in chrome — desktop left sidebar + mobile brand bar and bottom tab
 * nav — wrapped around any page's content. Lives as a component (not just the
 * (app) layout) so public-but-signed-in surfaces like /schemes can render the
 * same shell; SideNav/BottomNav highlight the active tab from the pathname.
 * Content sets its own width inside the padded <main>.
 */
export default function AppShell({
  avatar = "🙂",
  alias = "You",
  isAdmin = false,
  children,
}: {
  avatar?: string;
  alias?: string;
  isAdmin?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl">
      <SideNav isAdmin={isAdmin} avatar={avatar} alias={alias} />

      <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col lg:border-r lg:border-line">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-cream/90 px-4 py-2.5 backdrop-blur lg:hidden">
          <Brand size="sm" withTagline />
          <Link
            href="/me"
            aria-label="Your profile"
            className="grid h-9 w-9 place-items-center rounded-full bg-surface text-xl shadow-sm ring-1 ring-line"
          >
            {avatar}
          </Link>
        </header>

        <main className="flex-1 px-4 pb-24 pt-4 lg:px-8 lg:pb-12 lg:pt-8">
          {children}
        </main>

        <BottomNav isAdmin={isAdmin} />
      </div>
    </div>
  );
}
