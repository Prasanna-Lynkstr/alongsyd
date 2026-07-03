/**
 * Search vocabulary — maps everyday words a parent might type to the taxonomy
 * tags stored on questions. Used by the engine's query-understanding step to
 * boost results whose condition/topic matches what the query is really about.
 *
 * This is CONFIG (vertical vocabulary), not engine. A second vertical swaps it.
 * Keep terms lowercase. Multi-word terms are matched as substrings; single
 * words are matched on word boundaries.
 */

import type { ConditionValue, TopicValue } from "./taxonomy";

export type SynonymRule = {
  /** trigger words/phrases (lowercase) */
  match: string[];
  conditions?: ConditionValue[];
  topics?: TopicValue[];
};

export const SEARCH_SYNONYMS: SynonymRule[] = [
  // --- conditions ---
  { match: ["autism", "autistic", "asd", "spectrum"], conditions: ["autism"] },
  {
    match: ["adhd", "hyperactive", "hyperactivity", "attention deficit", "inattentive"],
    conditions: ["adhd"],
  },
  { match: ["down syndrome", "down's", "downs", "trisomy"], conditions: ["down-syndrome"] },
  { match: ["cerebral palsy", "cp", "spastic"], conditions: ["cerebral-palsy"] },
  {
    match: ["intellectual disability", "cognitive delay", "developmental delay"],
    conditions: ["intellectual-disability"],
  },
  {
    match: ["dyslexia", "dyslexic", "dyscalculia", "dysgraphia", "learning disability", "learning difficulty"],
    conditions: ["learning-disability"],
  },
  {
    match: [
      "speech", "speaking", "talking", "talk", "non-verbal", "nonverbal",
      "late talker", "language delay", "stammer", "stutter", "articulation",
      "not saying words", "speech therapist", "speech therapy",
    ],
    conditions: ["speech-delay"],
    topics: ["therapy"],
  },
  { match: ["epilepsy", "seizure", "seizures", "fits", "convulsion"], conditions: ["epilepsy"] },
  {
    match: ["hearing", "deaf", "hard of hearing", "cochlear", "hearing aid", "hearing impaired"],
    conditions: ["hearing-impairment"],
  },
  {
    match: ["vision", "visual", "blind", "low vision", "braille", "sighted"],
    conditions: ["visual-impairment"],
  },

  // --- topics ---
  {
    match: [
      "therapy", "therapist", "occupational therapy", "ot ", "physiotherapy",
      "physio", "aba", "behavioural therapy", "early intervention",
    ],
    topics: ["therapy"],
  },
  {
    match: ["school", "teacher", "classroom", "inclusion", "iep", "admission", "board exam", "accommodation", "shadow teacher"],
    topics: ["school-inclusion"],
  },
  {
    match: ["behaviour", "behavior", "meltdown", "tantrum", "aggression", "self-harm", "stimming", "biting"],
    topics: ["behaviour"],
  },
  {
    match: ["communication", "aac", "sign language", "picture cards", "pecs", "communication app"],
    topics: ["communication"],
  },
  { match: ["diagnosis", "assessment", "evaluation", "screening", "wait and watch"], topics: ["diagnosis"] },
  {
    match: [
      "scheme", "schemes", "certificate", "udid", "niramaya", "pension",
      "disability certificate", "benefit", "benefits", "subsidy", "concession", "tax",
    ],
    topics: ["government-schemes"],
  },
  { match: ["guardianship", "legal", "rights", "will ", "trust", "custody"], topics: ["legal-rights"] },
  { match: ["sibling", "siblings", "brother", "sister"], topics: ["siblings-family"] },
  {
    match: ["burnout", "burnt out", "exhausted", "overwhelmed", "stressed", "my own", "self-care", "mental health"],
    topics: ["self-care"],
  },
  {
    match: ["future", "adulthood", "after us", "after we", "independent living", "vocational", "employment"],
    topics: ["future-planning"],
  },
  {
    match: ["toilet", "feeding", "dressing", "self-help", "daily living", "accessible", "wheelchair"],
    topics: ["daily-living"],
  },
];
