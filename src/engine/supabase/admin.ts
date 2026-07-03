import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from "./env";

/**
 * Service-role client. BYPASSES Row Level Security. Server-only.
 *
 * Used exclusively for moderation / admin actions (verify a user, remove
 * content, resolve flags) inside route handlers that have already confirmed the
 * caller is an admin via requireAdmin(). Never import this into a Client
 * Component — the "server-only" guard will throw at build time if you try.
 */
export function createAdminClient() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set — admin/moderation actions are " +
        "disabled. Add it to .env.local (see README).",
    );
  }
  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
