import Brand from "@/components/Brand";
import { signInPlatform } from "./actions";

/**
 * The platform-owner key gate. Intentionally spartan — a single secret field,
 * no links into the app. Shown when there's no valid platform session.
 */
export default function Login({ error }: { error?: boolean }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <Brand size="lg" href={null} />
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-teal-strong/90">
          Platform console
        </p>
        <p className="mt-2 text-sm text-muted">
          Owner access only. Enter the platform key to view usage and health.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          That key didn&apos;t match. Try again.
        </p>
      )}

      <form action={signInPlatform} className="space-y-3">
        <input
          type="password"
          name="key"
          required
          autoFocus
          placeholder="Platform key"
          autoComplete="off"
          className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink outline-none focus:border-teal"
        />
        <button
          type="submit"
          className="w-full rounded-xl bg-teal py-3 font-semibold text-surface"
        >
          Unlock console
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-faint">
        Separate from parent sign-in. Sessions expire after 8 hours.
      </p>
    </main>
  );
}
