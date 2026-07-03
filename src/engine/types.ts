/**
 * Domain types for the generic Q&A engine.
 *
 * These describe rows as the app consumes them (camelCase). The engine is
 * vertical-agnostic: `condition`, `ageBand`, `topic`, `state` are just string
 * tags whose vocabulary lives in src/config/taxonomy.ts.
 */

export type Profile = {
  id: string;
  alias: string;
  avatar: string;
  /** child's condition tag — NEVER the child's name (we don't store names) */
  condition: string | null;
  childAge: number | null;
  city: string | null;
  state: string | null;
  isVerified: boolean;
  isAdmin: boolean;
  consentedAt: string | null;
  onboardedAt: string | null;
  createdAt: string;
};

/** The safe, public face of a parent. No phone, no child name — by construction. */
export type PublicAuthor = {
  id: string;
  alias: string;
  avatar: string;
  isVerified: boolean;
};

export type Question = {
  id: string;
  author: PublicAuthor | null;
  title: string;
  body: string;
  condition: string | null;
  ageBand: string | null;
  city: string | null;
  state: string | null;
  topic: string | null;
  answerCount: number;
  createdAt: string;
  isRemoved: boolean;
};

export type Answer = {
  id: string;
  questionId: string;
  author: PublicAuthor | null;
  body: string;
  helpedCount: number;
  /** did the current viewer mark this helpful? */
  viewerFoundHelpful: boolean;
  createdAt: string;
  isRemoved: boolean;
};

/** A crowd-sourced note attached to a baseline scheme (parent experience). */
export type SchemeNote = {
  id: string;
  schemeId: string;
  state: string | null;
  district: string | null;
  author: PublicAuthor | null;
  body: string;
  createdAt: string;
  isRemoved: boolean;
};

/** A parent flag that a scheme is missing/wrong for their state. */
export type SchemeFlag = {
  id: string;
  schemeId: string | null;
  state: string | null;
  note: string;
  resolved: boolean;
  createdAt: string;
};

export type Report = {
  id: string;
  targetType: "question" | "answer" | "scheme_note";
  targetId: string;
  reason: string;
  resolved: boolean;
  createdAt: string;
};
