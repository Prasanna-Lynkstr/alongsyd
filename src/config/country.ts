/**
 * Country / market configuration — the single seam that makes Alongsyd
 * multi-market.
 *
 * Everything that varies by country lives here: the region (state/province)
 * list, phone dial code, currency, and the benefits framing. The rest of the
 * app is geography-neutral and reads the active `COUNTRY` from this file.
 *
 * ── To add a market ─────────────────────────────────────────────────────────
 *   1. Copy a block in COUNTRIES below and fill it in (code, regions, copy…).
 *   2. Provide that market's CONTENT packs — these are data, not code:
 *        · src/config/schemes.json         (that country's benefits)
 *        · src/config/seed-questions.json  (that country's seed Q&As)
 *   3. Set NEXT_PUBLIC_COUNTRY=<code> in the environment (defaults to "IN").
 *   Nothing else in the app needs to change.
 * ────────────────────────────────────────────────────────────────────────────
 */

export type Region = { value: string; label: string };

export type Country = {
  /** ISO-ish market code, e.g. "IN". Stored on data + used to select config. */
  code: string;
  name: string;
  flag: string;
  /** International dialing code for phone-OTP sign-in, e.g. "+91". */
  dialCode: string;
  /** Placeholder phone number shown in the sign-in form. */
  phoneExample: string;
  currency: { code: string; symbol: string };
  /** What a first-level region is called here ("State", "Province"…). */
  regionNoun: string;
  regionNounPlural: string;
  /** First-level regions. `value` is the code we store on profiles/questions. */
  regions: Region[];
  /** How the benefits / scheme-checker surface is framed for this market. */
  benefits: {
    /** e.g. "Indian disability schemes" */
    name: string;
    /** a few example scheme names for the intro line */
    examples: string;
  };
};

export const COUNTRIES: Record<string, Country> = {
  IN: {
    code: "IN",
    name: "India",
    flag: "🇮🇳",
    dialCode: "+91",
    phoneExample: "+91 98765 43210",
    currency: { code: "INR", symbol: "₹" },
    regionNoun: "State",
    regionNounPlural: "States",
    regions: [
      { value: "AN", label: "Andaman & Nicobar Islands" },
      { value: "AP", label: "Andhra Pradesh" },
      { value: "AR", label: "Arunachal Pradesh" },
      { value: "AS", label: "Assam" },
      { value: "BR", label: "Bihar" },
      { value: "CH", label: "Chandigarh" },
      { value: "CG", label: "Chhattisgarh" },
      { value: "DN", label: "Dadra & Nagar Haveli and Daman & Diu" },
      { value: "DL", label: "Delhi (NCT)" },
      { value: "GA", label: "Goa" },
      { value: "GJ", label: "Gujarat" },
      { value: "HR", label: "Haryana" },
      { value: "HP", label: "Himachal Pradesh" },
      { value: "JK", label: "Jammu & Kashmir" },
      { value: "JH", label: "Jharkhand" },
      { value: "KA", label: "Karnataka" },
      { value: "KL", label: "Kerala" },
      { value: "LA", label: "Ladakh" },
      { value: "LD", label: "Lakshadweep" },
      { value: "MP", label: "Madhya Pradesh" },
      { value: "MH", label: "Maharashtra" },
      { value: "MN", label: "Manipur" },
      { value: "ML", label: "Meghalaya" },
      { value: "MZ", label: "Mizoram" },
      { value: "NL", label: "Nagaland" },
      { value: "OD", label: "Odisha" },
      { value: "PY", label: "Puducherry" },
      { value: "PB", label: "Punjab" },
      { value: "RJ", label: "Rajasthan" },
      { value: "SK", label: "Sikkim" },
      { value: "TN", label: "Tamil Nadu" },
      { value: "TG", label: "Telangana" },
      { value: "TR", label: "Tripura" },
      { value: "UP", label: "Uttar Pradesh" },
      { value: "UK", label: "Uttarakhand" },
      { value: "WB", label: "West Bengal" },
    ],
    benefits: {
      name: "Indian disability schemes",
      examples: "certificates, UDID, Niramaya, tax relief",
    },
  },

  // ── EXAMPLE / TEMPLATE (not active) ────────────────────────────────────────
  // A second market to show the shape. Before activating it (NEXT_PUBLIC_COUNTRY=US)
  // you must also supply a US schemes.json + seed-questions.json. Regions here
  // are a trimmed sample, not the full 50 states.
  US: {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    dialCode: "+1",
    phoneExample: "+1 (555) 012-3456",
    currency: { code: "USD", symbol: "$" },
    regionNoun: "State",
    regionNounPlural: "States",
    regions: [
      { value: "CA", label: "California" },
      { value: "NY", label: "New York" },
      { value: "TX", label: "Texas" },
      { value: "FL", label: "Florida" },
      { value: "WA", label: "Washington" },
    ],
    benefits: {
      name: "US disability benefits",
      examples: "SSI, Medicaid waivers, IEP/504, ABLE accounts",
    },
  },
};

/** Active market. Set NEXT_PUBLIC_COUNTRY in the environment; defaults to India. */
export const ACTIVE_COUNTRY_CODE = (
  process.env.NEXT_PUBLIC_COUNTRY ?? "IN"
).toUpperCase();

export const COUNTRY: Country =
  COUNTRIES[ACTIVE_COUNTRY_CODE] ?? COUNTRIES.IN;

export function regionLabel(value?: string | null): string {
  if (!value) return "";
  return COUNTRY.regions.find((r) => r.value === value)?.label ?? value;
}
