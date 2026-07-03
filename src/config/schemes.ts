import schemesData from "./schemes.json";

/**
 * Typed loader + eligibility matcher over the baseline scheme config.
 * The JSON in schemes.json is the authoritative, editable baseline. This file
 * only gives it types and a pure matcher — no database, no auth.
 */

export type Scheme = {
  id: string;
  name: string;
  authority: string;
  level: "national" | "state";
  summary: string;
  benefits: string[];
  eligibility: {
    conditions: string[]; // ["*"] = all, else condition codes
    minAge: number;
    maxAge: number | null;
    minDisabilityPercent?: number | null;
    notes?: string;
  };
  claimSteps: string[];
  documents: string[];
  officialLink: string;
  appliesToStates: string[]; // ["*"] = all, else 2-letter codes
};

type SchemesFile = {
  disclaimer: string;
  lastReviewed: string;
  schemes: Scheme[];
};

const data = schemesData as SchemesFile;

export const SCHEMES: Scheme[] = data.schemes ?? [];
export const SCHEMES_DISCLAIMER = data.disclaimer ?? "";
export const SCHEMES_LAST_REVIEWED = data.lastReviewed ?? "";

export function getScheme(id: string): Scheme | undefined {
  return SCHEMES.find((s) => s.id === id);
}

export type SchemeQuery = {
  condition?: string | null;
  age?: number | null;
  state?: string | null;
};

function matchesCondition(scheme: Scheme, condition?: string | null): boolean {
  const list = scheme.eligibility.conditions;
  if (!condition || list.includes("*")) return true;
  return list.includes(condition);
}

function matchesAge(scheme: Scheme, age?: number | null): boolean {
  if (age == null) return true;
  const { minAge, maxAge } = scheme.eligibility;
  if (age < (minAge ?? 0)) return false;
  if (maxAge != null && age > maxAge) return false;
  return true;
}

function matchesState(scheme: Scheme, state?: string | null): boolean {
  if (scheme.appliesToStates.includes("*")) return true;
  if (!state) return scheme.level === "national"; // hide state schemes until a state is chosen
  return scheme.appliesToStates.includes(state);
}

/**
 * Returns schemes that apply, national first, then state-specific. A scheme is
 * included when it matches on all three provided dimensions (missing dimensions
 * are treated as "no constraint", except state schemes hide until a state is
 * chosen).
 */
export function matchSchemes(query: SchemeQuery): Scheme[] {
  return SCHEMES.filter(
    (s) =>
      matchesCondition(s, query.condition) &&
      matchesAge(s, query.age) &&
      matchesState(s, query.state),
  ).sort((a, b) => {
    if (a.level !== b.level) return a.level === "national" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}
