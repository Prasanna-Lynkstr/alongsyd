import Link from "next/link";
import { redirect } from "next/navigation";
import Brand from "@/components/Brand";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";
import { getProfile, getUser } from "@/engine/auth";

/**
 * Shell for the signed-in surfaces (Ask, You, Admin). Responsive:
 *  - mobile: sticky brand bar on top, fixed bottom tab nav.
 *  - desktop (lg+): a left sidebar nav and a wider content canvas.
 * Requires a signed-in user; per-page gates handle the finer "fully onboarded"
 * check. Each page sets its own content width.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");
  const profile = await getProfile();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl">
      <SideNav
        isAdmin={profile?.isAdmin ?? false}
        avatar={profile?.avatar ?? "🙂"}
        alias={profile?.alias || "You"}
      />

      <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col lg:border-r lg:border-line">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-cream/90 px-4 py-2.5 backdrop-blur lg:hidden">
          <Brand size="sm" withTagline />
          <Link
            href="/me"
            aria-label="Your profile"
            className="grid h-9 w-9 place-items-center rounded-full bg-surface text-xl shadow-sm ring-1 ring-line"
          >
            {profile?.avatar ?? "🙂"}
          </Link>
        </header>

        <main className="flex-1 px-4 pb-24 pt-4 lg:px-8 lg:pb-12 lg:pt-8">
          {children}
        </main>

        <BottomNav isAdmin={profile?.isAdmin ?? false} />
      </div>
    </div>
  );
}
