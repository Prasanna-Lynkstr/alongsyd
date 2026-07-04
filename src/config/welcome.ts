/**
 * Onboarding copy + the illustrative journey roadmap. Content, not logic —
 * lives in config so it can be reworded without touching components.
 */

export const TAGLINE = "For every step, and the ones after";

/**
 * Example aliases offered on the sign-up screen. They do two jobs: show the
 * tone we want — humble, fellow-parent, never a real name or an authority
 * claim — and make choosing a one-tap decision. Ordered grounded → warm →
 * relatable. Data, not code: reword or reorder freely.
 */
export const ALIAS_SUGGESTIONS = [
  "StillLearning",
  "OneDayAtATime",
  "AppaOf2011",
  "SlowAndSteady",
  "WalkingAlongside",
  "HisPace",
  "ParentInProgress",
  "FellowParent",
];

/** Who Alongsyd is for — said plainly but warmly. Used as the hero eyebrow so
 *  a parent knows in one glance this is their place, without a clinical banner. */
export const AUDIENCE = "For parents raising a child with special needs";

/**
 * Concrete surfaces on the roadmap — hinted on the landing page so the product
 * reads as a whole-journey companion, not just a Q&A board. These are the
 * things a special-needs family actually hunts for, in journey order.
 * Illustrative direction, not dated promises.
 */
export const PLANNED_SURFACES = [
  "Therapist & clinic directory",
  "Special-school finder",
  "Respite & long-term care homes",
  "Guardianship & after-us planning",
];

export const WELCOME = {
  heading: "Welcome to Alongsyd",
  lead: "You're not meant to walk this alone.",
  body: "Alongsyd is a companion for the whole journey — from diagnosis through the years ahead, including the questions no one else talks about. It runs on the lived wisdom of parents who've walked this road before you: every question asked and answered makes it smarter for the next family. You're not just getting help — you're building it, alongside each other. For now, start simple. Ask what's on your mind.",
  cta: "Start simple — ask what's on your mind",
};

/**
 * The greyed-out journey strip. Non-interactive, illustrative only — it signals
 * the roadmap without building the stages. Exactly one stage is "here".
 */
export type JourneyStage = {
  key: string;
  label: string;
  status: "here" | "coming";
};

export const JOURNEY: JourneyStage[] = [
  { key: "diagnosis", label: "Diagnosis", status: "here" },
  { key: "school", label: "School years", status: "coming" },
  { key: "adulthood", label: "Adulthood", status: "coming" },
  { key: "after-us", label: "After-us", status: "coming" },
];
