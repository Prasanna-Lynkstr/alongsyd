/**
 * Seed script — loads the starter Q&As (and a few scheme notes) so the pilot
 * community never launches into an empty room. Idempotent: re-running replaces
 * the seed-authored content without touching real parents' posts.
 *
 * Run with:  pnpm seed
 * Needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local.
 *
 * The baseline SCHEMES themselves are file config (src/config/schemes.json) and
 * are read directly by the app — they don't need loading into the database.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

loadEnv({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    "✖ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seed = JSON.parse(
  readFileSync(path.join(__dirname, "../src/config/seed-questions.json"), "utf8"),
) as { questions: SeedQuestion[] };

type SeedAnswer = {
  alias: string;
  avatar: string;
  verified: boolean;
  body: string;
  helpedCount: number;
  createdOffsetDays: number;
};
type SeedQuestion = {
  alias: string;
  avatar: string;
  condition: string;
  childAge: number;
  city: string;
  state: string;
  topic: string;
  title: string;
  body: string;
  createdOffsetDays: number;
  answers: SeedAnswer[];
};

function ageToBand(age: number): string {
  if (age <= 3) return "0-3";
  if (age <= 6) return "4-6";
  if (age <= 12) return "7-12";
  if (age <= 18) return "13-18";
  return "18+";
}
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const daysAgo = (d: number) =>
  new Date(Date.now() - d * 86_400_000).toISOString();

// ---- collect authors (with the strongest identity across their posts) -------
type Author = { alias: string; avatar: string; verified: boolean };
const authors = new Map<string, Author>();
function noteAuthor(a: Author) {
  const existing = authors.get(a.alias);
  authors.set(a.alias, {
    alias: a.alias,
    avatar: a.avatar || existing?.avatar || "🙂",
    verified: existing?.verified || a.verified,
  });
}
for (const q of seed.questions) {
  noteAuthor({ alias: q.alias, avatar: q.avatar, verified: false });
  for (const ans of q.answers)
    noteAuthor({ alias: ans.alias, avatar: ans.avatar, verified: ans.verified });
}

async function getOrCreateUser(a: Author): Promise<string> {
  const email = `seed-${slug(a.alias)}@alongsyd.seed`;
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { seed: true },
  });
  let id = created?.user?.id;
  if (error || !id) {
    // Already exists — find it by paging through users.
    let page = 1;
    while (!id) {
      const { data } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (!data || data.users.length === 0) break;
      id = data.users.find((u) => u.email === email)?.id;
      page += 1;
    }
  }
  if (!id) throw new Error(`Could not create/find seed user for ${a.alias}`);

  await admin.from("profiles").upsert({
    id,
    alias: a.alias,
    avatar: a.avatar,
    is_verified: a.verified,
    consented_at: new Date().toISOString(),
    onboarded_at: new Date().toISOString(),
  });
  return id;
}

async function main() {
  console.log(`Seeding ${seed.questions.length} questions…`);

  // 1) Users + profiles
  const idByAlias = new Map<string, string>();
  for (const a of authors.values()) {
    idByAlias.set(a.alias, await getOrCreateUser(a));
  }
  const seedIds = [...idByAlias.values()];
  console.log(`  ✓ ${seedIds.length} seed identities ready`);

  // 2) Clear prior seed content (so re-runs are clean, real data untouched)
  await admin.from("helpful_votes").delete().in("user_id", seedIds);
  await admin.from("answers").delete().in("author_id", seedIds);
  await admin.from("questions").delete().in("author_id", seedIds);
  await admin.from("scheme_notes").delete().in("author_id", seedIds);

  // 3) Questions + answers
  let qCount = 0;
  let aCount = 0;
  let vCount = 0;
  for (const q of seed.questions) {
    const authorId = idByAlias.get(q.alias)!;
    const { data: inserted, error } = await admin
      .from("questions")
      .insert({
        author_id: authorId,
        title: q.title,
        body: q.body,
        condition: q.condition,
        age_band: ageToBand(q.childAge),
        city: q.city,
        state: q.state,
        topic: q.topic,
        created_at: daysAgo(q.createdOffsetDays),
      })
      .select("id")
      .single();
    if (error) {
      console.error(`  ✖ question "${q.title}":`, error.message);
      continue;
    }
    qCount += 1;

    for (const ans of q.answers) {
      const ansAuthor = idByAlias.get(ans.alias)!;
      const { data: insertedA, error: aErr } = await admin
        .from("answers")
        .insert({
          question_id: inserted!.id,
          author_id: ansAuthor,
          body: ans.body,
          created_at: daysAgo(ans.createdOffsetDays),
        })
        .select("id")
        .single();
      if (aErr) {
        console.error(`    ✖ answer:`, aErr.message);
        continue;
      }
      aCount += 1;

      // Back the "this helped" count with REAL votes from distinct seed
      // parents. helped_count is maintained by a DB trigger from the votes
      // table, so seeding the number alone would collapse to the true count on
      // the first real vote — seeding the votes keeps it honest and durable.
      const voters = seedIds
        .filter((id) => id !== ansAuthor)
        .slice(0, ans.helpedCount);
      if (voters.length) {
        const { error: vErr } = await admin.from("helpful_votes").insert(
          voters.map((uid) => ({
            answer_id: insertedA!.id,
            user_id: uid,
            created_at: daysAgo(ans.createdOffsetDays),
          })),
        );
        if (vErr) console.error(`    ✖ votes:`, vErr.message);
        else vCount += voters.length;
      }
    }
  }
  console.log(`  ✓ ${qCount} questions, ${aCount} answers, ${vCount} helpful votes`);

  // 4) A few starter scheme notes so the "From parents" layer isn't empty.
  const firstAuthor = seedIds[0];
  const firstAuthorMeta = [...authors.values()][0];
  const STARTER_NOTES = [
    {
      scheme_id: "disability-certificate",
      state: "MH",
      district: "Pune",
      body: "Booked the medical board slot online first — walk-ins were turned away. Carry 3 sets of photocopies; they ask for originals + copies of everything.",
    },
    {
      scheme_id: "udid-card",
      state: "KA",
      district: "Bengaluru",
      body: "Applied on swavlambancard.gov.in right after the disability certificate. The physical card took ~10 weeks but the e-copy downloaded from the portal was accepted at the railway counter.",
    },
    {
      scheme_id: "niramaya-health-insurance",
      state: "TN",
      district: "Chennai",
      body: "Enrolled through our National Trust registered organisation (RO). Renewal is yearly — set a reminder, ours lapsed once and re-enrolment took a fresh set of documents.",
    },
  ];
  for (const n of STARTER_NOTES) {
    await admin.from("scheme_notes").insert({
      ...n,
      author_id: firstAuthor,
      author_alias: firstAuthorMeta.alias,
      author_avatar: firstAuthorMeta.avatar,
      author_verified: firstAuthorMeta.verified,
    });
  }
  console.log(`  ✓ ${STARTER_NOTES.length} starter scheme notes`);

  console.log("Done. 🌱");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
