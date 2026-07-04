import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getProfile, getUser } from "@/engine/auth";

/**
 * Shell for the signed-in surfaces (Ask, You, Admin). Responsive chrome lives
 * in <AppShell>; here we just gate on a signed-in user (per-page gates handle
 * the finer "fully onboarded" check) and feed the profile in.
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
    <AppShell
      isAdmin={profile?.isAdmin ?? false}
      avatar={profile?.avatar ?? "🙂"}
      alias={profile?.alias || "You"}
    >
      {children}
    </AppShell>
  );
}
