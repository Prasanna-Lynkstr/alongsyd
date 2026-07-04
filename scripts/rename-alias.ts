/**
 * One-off: replace a parent's display alias with a generated, non-real-name
 * handle in the app's own style (e.g. QuietDawn, WarmHarbor42). Use when a
 * real name slipped into the alias field and needs anonymising in the backend.
 *
 * Targets by AUTH EMAIL (precise — never touches a seed user or another parent
 * who happens to share the alias text).
 *
 *   pnpm tsx scripts/rename-alias.ts --email=you@example.com              # dry run
 *   pnpm tsx scripts/rename-alias.ts --email=you@example.com --confirm    # apply
 *   pnpm tsx scripts/rename-alias.ts --email=you@example.com --alias=Foo  # set a specific one
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

loadEnv({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    "✖ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
}

const CONFIRM = process.argv.includes("--confirm");
const EMAIL = arg("email");
const EXPLICIT_ALIAS = arg("alias");

if (!EMAIL) {
  console.error("✖ Pass --email=<the account's sign-in email>.");
  process.exit(1);
}

const ADJECTIVES = [
  "Quiet", "Gentle", "Warm", "Calm", "Steady", "Kind", "Brave", "Soft",
  "Bright", "Hopeful", "Patient", "Tender", "Still", "Golden", "Easy", "Sunny",
];
const NOUNS = [
  "Dawn", "Harbor", "Meadow", "River", "Lantern", "Willow", "Haven", "Compass",
  "Anchor", "Garden", "Shore", "Breeze", "Grove", "Cove", "Field", "Trail",
];
const pick = <T,>(xs: T[]) => xs[crypto.randomInt(xs.length)];

function generateAlias(taken: Set<string>): string {
  for (let i = 0; i < 50; i++) {
    const base = `${pick(ADJECTIVES)}${pick(NOUNS)}`;
    const candidate = i < 25 ? base : `${base}${crypto.randomInt(10, 99)}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
  return `${pick(ADJECTIVES)}${pick(NOUNS)}${crypto.randomInt(100, 999)}`;
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** Find the auth user id for an email by paging through the admin user list. */
async function findUserId(email: string): Promise<string | null> {
  const target = email.trim().toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === target);
    if (hit) return hit.id;
    if (data.users.length < 200) break;
  }
  return null;
}

async function main() {
  const userId = await findUserId(EMAIL!);
  if (!userId) {
    console.error(`✖ No auth user found with email ${EMAIL}.`);
    process.exit(1);
  }

  const { data: profile, error } = await admin
    .from("profiles")
    .select("id, alias, avatar")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!profile) {
    console.error(`✖ User ${EMAIL} has no profile row yet.`);
    process.exit(1);
  }

  // Avoid colliding with an existing alias.
  const { data: allAliases } = await admin.from("profiles").select("alias");
  const taken = new Set(
    (allAliases ?? []).map((r) => String(r.alias ?? "").toLowerCase()),
  );

  const newAlias = EXPLICIT_ALIAS || generateAlias(taken);

  console.log(`Account:   ${EMAIL} (${userId})`);
  console.log(`Current:   ${profile.avatar ?? ""} "${profile.alias}"`);
  console.log(`New alias: ${profile.avatar ?? ""} "${newAlias}"`);

  if (!CONFIRM) {
    console.log("\n(dry run — re-run with --confirm to apply)");
    return;
  }

  const { error: upErr } = await admin
    .from("profiles")
    .update({ alias: newAlias })
    .eq("id", userId);
  if (upErr) throw upErr;
  console.log("\n✓ Alias updated.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
