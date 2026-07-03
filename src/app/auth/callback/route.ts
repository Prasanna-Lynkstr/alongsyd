import { NextResponse } from "next/server";
import { createClient } from "@/engine/supabase/server";

/**
 * Magic-link / OTP callback. Supabase redirects here with a `code`; we exchange
 * it for a session (cookies) and then hand off to /auth/continue, which decides
 * where in onboarding the parent should land.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errorDescription = searchParams.get("error_description");

  if (errorDescription) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription)}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/auth/continue`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not sign you in`);
}
