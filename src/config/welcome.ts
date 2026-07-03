/**
 * Onboarding copy + the illustrative journey roadmap. Content, not logic —
 * lives in config so it can be reworded without touching components.
 */

export const TAGLINE = "For every step, and the ones after";

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
