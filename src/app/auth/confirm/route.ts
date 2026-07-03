import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/engine/supabase/server";

/** Relative redirect — resolves against the public URL, not the proxied port. */
function bounce(path: string) {
  return new NextResponse(null, { status: 303, headers: { Location: path } });
}

/**
 * Token-hash email confirmation (Supabase's SSR pattern). Handles sign-in links
 * of the form /auth/confirm?token_hash=…&type=… — admin-generated links and any
 * email template that sends {{ .TokenHash }}. Complements /auth/callback (PKCE).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next");
  // Only allow internal paths (guards against open redirects).
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/auth/continue";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return bounce(next);
  }

  return bounce(
    `/login?error=${encodeURIComponent("Sign-in link is invalid or expired")}`,
  );
}
