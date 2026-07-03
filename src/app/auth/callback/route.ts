import { NextResponse } from "next/server";
import { createClient } from "@/engine/supabase/server";

/**
 * Emit a RELATIVE redirect so the browser resolves it against the public URL it
 * actually requested (e.g. https://alongsyd.lynkstr.com) — NOT the internal
 * address the app is bound to behind a reverse proxy (e.g. localhost:3100).
 * Building an absolute URL from request.url breaks sign-in behind nginx.
 */
function bounce(path: string) {
  return new NextResponse(null, { status: 303, headers: { Location: path } });
}

/**
 * Magic-link / OTP callback. Supabase redirects here with a `code`; we exchange
 * it for a session (cookies) and hand off to /auth/continue.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const errorDescription = searchParams.get("error_description");

  if (errorDescription) {
    return bounce(`/login?error=${encodeURIComponent(errorDescription)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return bounce("/auth/continue");
  }

  return bounce(`/login?error=${encodeURIComponent("Could not sign you in")}`);
}
