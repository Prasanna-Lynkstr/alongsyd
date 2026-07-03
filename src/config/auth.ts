/**
 * Auth configuration.
 *
 * Phone OTP is fully built, but disabled by default for the pilot (email
 * magic-link only — no SMS provider needed). To re-enable it later, set
 * NEXT_PUBLIC_PHONE_AUTH=true and configure an SMS provider in Supabase.
 */
export const PHONE_AUTH_ENABLED =
  process.env.NEXT_PUBLIC_PHONE_AUTH === "true";
