/**
 * Gentle, in-UI safeguards. These NUDGE, they don't police — the tone of the
 * product is trust, not enforcement. Two jobs:
 *  1. Warn (softly) when a post looks like it names the child, since we never
 *     want the child's real name in the community.
 *  2. Provide the supportive-phrasing prompt shown while composing an answer.
 */

/**
 * Heuristic for a possibly-named child. Deliberately conservative: it looks for
 * explicit naming patterns ("his name is X", "my son X said"). It returns a
 * nudge, never a hard block — the compose UI shows a friendly reminder and lets
 * the parent post anyway.
 */
export function detectPossibleChildName(text: string): {
  flagged: boolean;
  reason?: string;
} {
  const t = ` ${text} `;

  // "named Rohan", "his/her name is Aditi", "call him Kabir"
  const namePhrase =
    /\b(name(?:d)?\s+(?:is|was)?\s*|call(?:ed)?\s+(?:him|her|them)\s+)([A-Z][a-z]+)/;
  if (namePhrase.test(text)) {
    return {
      flagged: true,
      reason:
        "It looks like this might include your child's name. To keep them safe, please refer to them by age + condition instead (e.g. “my 6-yr-old with autism”).",
    };
  }

  // "my son Rohan", "my daughter Aditi" (capitalised word right after the noun)
  const relationName = /\bmy\s+(son|daughter|child|kid|boy|girl)\s+([A-Z][a-z]+)/;
  const m = t.match(relationName);
  if (m && !/\b(is|has|was|and|the|who|with)\b/i.test(m[2])) {
    return {
      flagged: true,
      reason:
        "Looks like a name might have slipped in. Please describe your child by age + condition rather than by name — it keeps them private.",
    };
  }

  return { flagged: false };
}

/** The supportive-phrasing prompt shown while composing an answer. */
export const ANSWER_GUIDANCE =
  "Share what actually worked for you, kindly. Every family is different — offer your experience, not a verdict.";

/** Warm placeholder copy used across compose surfaces. */
export const PLACEHOLDERS = {
  questionTitle: "In one line — what do you most want help with?",
  questionBody:
    "Describe it the way you'd tell another parent. Refer to your child by age + condition (e.g. “my 6-yr-old with autism”), never by name.",
  answerBody: "Share what worked for you… gently and specifically.",
  schemeNote:
    "What helped when you claimed this? Timelines, which office, what got it rejected, local tips…",
};
