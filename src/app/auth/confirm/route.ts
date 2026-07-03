import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/engine/supabase/server";

/**
 * Token-hash email confirmation (Supabase's SSR pattern). Handles sign-in links
 * of the form /auth/confirm?token_hash=…&type=… — used by admin-generated
 * links (and any email template that sends {{ .TokenHash }}). Complements
 * /auth/callback, which handles the PKCE `?code=` flow from the in-app form.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/auth/continue";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Sign-in link is invalid or expired")}`,
  );
}
