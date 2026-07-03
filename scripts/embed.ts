/**
 * Backfill embeddings for questions that don't have one yet (seed content, or
 * anything posted while OpenAI was unset). Idempotent — only touches rows where
 * embedding is null. Run after `pnpm seed`, or any time.
 *
 *   pnpm embed
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + OPENAI_API_KEY.
 */
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

loadEnv({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("✖ Missing Supabase env vars in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BATCH = 96;

async function main() {
  // Import AFTER env is loaded so the embeddings module sees OPENAI_API_KEY.
  const { embedBatch, toVectorLiteral, isEmbeddingsConfigured } = await import(
    "../src/engine/embeddings"
  );
  if (!isEmbeddingsConfigured) {
    console.error("✖ Missing OPENAI_API_KEY in .env.local — cannot embed.");
    process.exit(1);
  }

  const { data: rows, error } = await admin
    .from("questions")
    .select("id, title, body")
    .is("embedding", null);
  if (error) {
    console.error("✖ query failed:", error.message);
    process.exit(1);
  }
  if (!rows || rows.length === 0) {
    console.log("Nothing to embed — every question already has an embedding. ✓");
    return;
  }

  console.log(`Embedding ${rows.length} question(s)…`);
  let done = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH);
    const vectors = await embedBatch(
      slice.map((r) => `${r.title}\n\n${r.body ?? ""}`),
    );

    for (let j = 0; j < slice.length; j++) {
      const vec = vectors[j];
      if (!vec) {
        failed += 1;
        continue;
      }
      const { error: uErr } = await admin
        .from("questions")
        .update({ embedding: toVectorLiteral(vec) })
        .eq("id", slice[j].id);
      if (uErr) {
        console.error(`  ✖ ${slice[j].id}:`, uErr.message);
        failed += 1;
      } else {
        done += 1;
      }
    }
    console.log(`  …${Math.min(i + BATCH, rows.length)}/${rows.length}`);
  }

  console.log(`Done. ✓ ${done} embedded${failed ? `, ✖ ${failed} failed` : ""}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
