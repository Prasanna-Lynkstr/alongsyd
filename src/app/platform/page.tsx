import Brand from "@/components/Brand";
import { getPlatformStats } from "@/engine/analytics";
import { isPlatformAuthed, isPlatformConfigured } from "@/engine/platform-auth";
import { SUPABASE_SERVICE_ROLE_KEY } from "@/engine/supabase/env";
import Dashboard from "./Dashboard";
import Login from "./Login";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Platform console",
  robots: { index: false, follow: false },
};

export default async function PlatformPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // No key configured → the console simply doesn't exist for this deployment.
  if (!isPlatformConfigured) return <NotConfigured />;

  if (!(await isPlatformAuthed())) {
    const { error } = await searchParams;
    return <Login error={Boolean(error)} />;
  }

  // Authed, but analytics need the service-role key to read across all parents.
  if (!SUPABASE_SERVICE_ROLE_KEY) return <NeedsServiceKey />;

  const stats = await getPlatformStats();
  return <Dashboard stats={stats} />;
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12 text-center">
      <div className="mb-6 flex justify-center">
        <Brand size="lg" href={null} />
      </div>
      {children}
    </main>
  );
}

function NotConfigured() {
  return (
    <Frame>
      <h1 className="text-lg font-semibold text-ink">Platform console is off</h1>
      <p className="mt-2 text-sm text-muted">
        Set <code>PLATFORM_ADMIN_KEY</code> in the environment to enable it (see
        the README / .env.example).
      </p>
    </Frame>
  );
}

function NeedsServiceKey() {
  return (
    <Frame>
      <h1 className="text-lg font-semibold text-ink">Analytics unavailable</h1>
      <p className="mt-2 text-sm text-muted">
        Add <code>SUPABASE_SERVICE_ROLE_KEY</code> so the console can read usage
        across all parents.
      </p>
    </Frame>
  );
}
