import { ageToBand } from "@/config/taxonomy";

/**
 * Capture → tags. Turns the raw fields a parent enters (plus their profile
 * defaults) into the tag set we store on a question. Pure and vertical-agnostic
 * in shape; the tag *vocabulary* comes from config/taxonomy.
 */
export type QuestionCapture = {
  title: string;
  body: string;
  condition: string | null;
  childAge: number | null;
  city: string | null;
  state: string | null;
  topic: string | null;
};

export type QuestionTags = {
  condition: string | null;
  ageBand: string | null;
  city: string | null;
  state: string | null;
  topic: string | null;
};

export function deriveTags(capture: QuestionCapture): QuestionTags {
  return {
    condition: capture.condition ?? null,
    ageBand:
      typeof capture.childAge === "number" ? ageToBand(capture.childAge) : null,
    city: capture.city?.trim() || null,
    state: capture.state ?? null,
    topic: capture.topic ?? null,
  };
}
