import Link from "next/link";
import { redirect } from "next/navigation";
import Brand from "@/components/Brand";
import BottomNav from "@/components/BottomNav";
import { getProfile, getUser } from "@/engine/auth";

/**
 * Shell for the signed-in surfaces (Ask, You, Admin). Provides the top brand
 * bar (with tagline) and the bottom tab nav. Requires a signed-in user;
 * per-page gates handle the finer "fully onboarded" check.
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
    <div className="mx-auto flex min-h-screen max-w-xl flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-cream/90 px-4 py-2.5 backdrop-blur">
        <Brand size="sm" withTagline />
        <Link
          href="/me"
          aria-label="Your profile"
          className="grid h-9 w-9 place-items-center rounded-full bg-surface text-xl shadow-sm ring-1 ring-line"
        >
          {profile?.avatar ?? "🙂"}
        </Link>
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">{children}</main>

      <BottomNav isAdmin={profile?.isAdmin ?? false} />
    </div>
  );
}
