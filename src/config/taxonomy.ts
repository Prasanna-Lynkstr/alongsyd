/**
 * Special-needs vertical taxonomy — the tag vocabulary for the pilot.
 *
 * This is CONFIG, not engine. A second vertical swaps this file (and the JSON
 * content files beside it) without touching src/engine or src/app. Keep the
 * shape stable; the engine only depends on the exported types + helpers below.
 */

import { COUNTRY } from "./country";

export type Option<T extends string = string> = {
  value: T;
  label: string;
  /** optional emoji shown beside the label in chips/dropdowns */
  icon?: string;
};

/** Conditions a child may have. `value` is the stored tag; keep kebab-case. */
export const CONDITIONS = [
  { value: "autism", label: "Autism / ASD", icon: "🧩" },
  { value: "adhd", label: "ADHD", icon: "⚡" },
  { value: "down-syndrome", label: "Down syndrome", icon: "💛" },
  { value: "cerebral-palsy", label: "Cerebral palsy", icon: "🌱" },
  { value: "intellectual-disability", label: "Intellectual disability", icon: "🧠" },
  { value: "learning-disability", label: "Learning disability (dyslexia etc.)", icon: "📖" },
  { value: "speech-delay", label: "Speech / language delay", icon: "💬" },
  { value: "epilepsy", label: "Epilepsy / seizures", icon: "✨" },
  { value: "hearing-impairment", label: "Hearing impairment", icon: "👂" },
  { value: "visual-impairment", label: "Visual impairment", icon: "👁️" },
  { value: "multiple-disabilities", label: "Multiple disabilities", icon: "🌈" },
  { value: "other", label: "Something else", icon: "🤝" },
] as const satisfies readonly Option[];

export type ConditionValue = (typeof CONDITIONS)[number]["value"];

/**
 * Age bands. A raw child age (years) maps to exactly one band via ageToBand().
 * We store both the raw age and the band tag on a question.
 */
export const AGE_BANDS = [
  { value: "0-3", label: "Early years (0–3)" },
  { value: "4-6", label: "Preschool (4–6)" },
  { value: "7-12", label: "Primary (7–12)" },
  { value: "13-18", label: "Teen (13–18)" },
  { value: "18+", label: "Adult (18+)" },
] as const satisfies readonly Option[];

export type AgeBandValue = (typeof AGE_BANDS)[number]["value"];

/** Optional topic tags for a question. */
export const TOPICS = [
  { value: "diagnosis", label: "Diagnosis & assessment" },
  { value: "therapy", label: "Therapy (OT / speech / behaviour)" },
  { value: "school-inclusion", label: "School & inclusion" },
  { value: "behaviour", label: "Behaviour" },
  { value: "communication", label: "Communication" },
  { value: "daily-living", label: "Daily living & self-help" },
  { value: "government-schemes", label: "Govt schemes & certificates" },
  { value: "legal-rights", label: "Legal rights" },
  { value: "siblings-family", label: "Siblings & family" },
  { value: "self-care", label: "Parent self-care" },
  { value: "future-planning", label: "Future planning (after-us)" },
] as const satisfies readonly Option[];

export type TopicValue = (typeof TOPICS)[number]["value"];

/**
 * First-level regions (states/provinces) come from the active market's country
 * config, so the region list is swapped by changing the country, not this file.
 */
export const STATES: readonly Option[] = COUNTRY.regions;

export type StateValue = string;

/** Avatar choices for a parent's safe second identity (emoji, no photos). */
export const AVATARS = [
  "🦊", "🐢", "🦉", "🐝", "🌻", "🌊", "⛰️", "🌙",
  "🪁", "🕊️", "🍀", "🐬", "🦋", "🌵", "🫖", "🧭",
] as const;

// ---- helpers (pure; safe to import anywhere) --------------------------------

export function ageToBand(age: number): AgeBandValue {
  if (age <= 3) return "0-3";
  if (age <= 6) return "4-6";
  if (age <= 12) return "7-12";
  if (age <= 18) return "13-18";
  return "18+";
}

export function labelFor(
  options: readonly Option[],
  value: string | null | undefined,
): string {
  if (!value) return "";
  return options.find((o) => o.value === value)?.label ?? value;
}

export const conditionLabel = (v?: string | null) => labelFor(CONDITIONS, v);
export const ageBandLabel = (v?: string | null) => labelFor(AGE_BANDS, v);
export const topicLabel = (v?: string | null) => labelFor(TOPICS, v);
export const stateLabel = (v?: string | null) => labelFor(STATES, v);

export const conditionIcon = (v?: string | null) =>
  CONDITIONS.find((c) => c.value === v)?.icon ?? "🤝";
