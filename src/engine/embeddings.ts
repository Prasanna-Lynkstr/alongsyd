/**
 * Text → vector embeddings for semantic search. Server-side only (holds the
 * API key). Provider-abstracted: swap the one `callProvider` below to change
 * models. Everything degrades gracefully — if no key is set, embed() returns
 * null and search falls back to keyword full-text search.
 *
 * Current provider: OpenAI text-embedding-3-small (1536 dims). This is search
 * infrastructure, not answer generation — answers stay human.
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
const MODEL = "text-embedding-3-small";

/** Must match the vector(N) column + match_questions() arg in the schema. */
export const EMBEDDING_DIM = 1536;

export const isEmbeddingsConfigured = Boolean(OPENAI_API_KEY);

/** Normalise text before embedding (collapse whitespace, cap length). */
function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 8000);
}

async function callProvider(inputs: string[]): Promise<number[][] | null> {
  if (!isEmbeddingsConfigured) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: MODEL, input: inputs }),
    });
    if (!res.ok) {
      console.error("[embeddings] provider error", res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as {
      data?: { embedding: number[]; index: number }[];
    };
    if (!json.data) return null;
    // Preserve input order (provider returns items with an index).
    return json.data
      .sort((a, b) => a.index - b.index)
      .map((d) => d.embedding);
  } catch (err) {
    console.error("[embeddings] request failed", err);
    return null;
  }
}

/** Embed one string. Returns null if embeddings aren't configured or fail. */
export async function embed(text: string): Promise<number[] | null> {
  const cleaned = clean(text);
  if (!cleaned) return null;
  const out = await callProvider([cleaned]);
  return out?.[0] ?? null;
}

/**
 * Embed many strings in one request (used by the backfill). Returns an array
 * aligned to the input, with null for any that couldn't be embedded.
 */
export async function embedBatch(
  texts: string[],
): Promise<(number[] | null)[]> {
  const cleaned = texts.map(clean);
  const out = await callProvider(cleaned);
  if (!out) return texts.map(() => null);
  return out;
}

/** pgvector columns/args accept the text form "[1,2,3]"; use this for writes. */
export function toVectorLiteral(v: number[]): string {
  return JSON.stringify(v);
}
