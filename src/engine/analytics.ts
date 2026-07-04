import "server-only";
import { createAdminClient } from "./supabase/admin";
import { getScheme } from "@/config/schemes";
import {
  ageBandLabel,
  conditionLabel,
  stateLabel,
  topicLabel,
} from "@/config/taxonomy";

/**
 * Platform analytics — everything the current schema can honestly tell the app
 * owner about usage, health, and where demand is pointing. Reads with the
 * service-role client (bypasses RLS) after the caller has passed the platform
 * gate. Pilot-scale by design: it pulls light columns and aggregates in JS
 * rather than adding SQL functions, so it works on the current DB with no new
 * migration to run.
 */

export type Slice = { key: string; label: string; count: number };
export type Bucket = { label: string; value: number };
type Row = Record<string, unknown>;

const DAY = 86_400_000;
const WEEK = 7 * DAY;

const num = (v: unknown): number =>
  typeof v === "number" ? v : Number(v) || 0;
const iso = (v: unknown): string | null => (v == null ? null : String(v));

function within(v: unknown, ms: number): boolean {
  const s = iso(v);
  return s ? Date.now() - new Date(s).getTime() <= ms : false;
}

function distinct(xs: unknown[]): number {
  return new Set(xs.filter(Boolean)).size;
}

/** Count rows by a field, label + rank them, keep the top N. */
function topSlices(
  rows: Row[],
  field: string,
  label: (v: string) => string,
  limit = 8,
): Slice[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const v = r[field];
    if (v == null || v === "") continue;
    const key = String(v);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, label: label(key) || key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Bucket ISO dates into the last `weeks` weekly counts, oldest → newest. */
function weekly(dates: unknown[], weeks = 8): Bucket[] {
  const now = Date.now();
  const out = new Array<number>(weeks).fill(0);
  for (const d of dates) {
    const s = iso(d);
    if (!s) continue;
    const w = Math.floor((now - new Date(s).getTime()) / WEEK);
    if (w >= 0 && w < weeks) out[weeks - 1 - w]++;
  }
  return out.map((value, i) => ({
    label: i === weeks - 1 ? "now" : `${weeks - 1 - i}w`,
    value,
  }));
}

export type PlatformStats = {
  generatedAt: string;
  totals: {
    parents: number;
    onboarded: number;
    consented: number;
    verified: number;
    questions: number;
    answers: number;
    helpfulVotes: number;
    savedSchemes: number;
    schemeNotes: number;
    pushReach: number;
    notifications: number;
  };
  growth: {
    parents7: number;
    parents30: number;
    questions7: number;
    answers7: number;
  };
  funnel: Slice[];
  engagement: {
    answerRate: number;
    unanswered: number;
    avgAnswers: number;
    contributors: number;
    activation: number;
  };
  weekly: { parents: Bucket[]; questions: Bucket[]; answers: Bucket[] };
  demand: {
    conditions: Slice[];
    topics: Slice[];
    states: Slice[];
    ageBands: Slice[];
    parentConditions: Slice[];
  };
  benefits: {
    topSaved: Slice[];
    activeClaimers: number;
    docChecks: number;
    notes: number;
    openFlags: number;
    flagStates: Slice[];
    flagSchemes: Slice[];
  };
  content: {
    unansweredOldest: {
      id: string;
      title: string;
      condition: string;
      ageDays: number;
    }[];
    removedQuestions: number;
    removedAnswers: number;
  };
  moderation: { openReports: number; openFlags: number };
  roadmap: { surface: string; demand: number; basis: string }[];
};

export async function getPlatformStats(): Promise<PlatformStats> {
  const db = createAdminClient();

  const [
    profilesR,
    questionsR,
    answersR,
    savedR,
    docChecksR,
    notesR,
    flagsR,
    reportsR,
    pushR,
    notifTotal,
  ] = await Promise.all([
    db
      .from("profiles")
      .select(
        "id, condition, state, child_age, is_verified, consented_at, onboarded_at, created_at",
      ),
    db
      .from("questions")
      .select(
        "id, author_id, title, condition, topic, state, age_band, answer_count, is_removed, created_at",
      ),
    db
      .from("answers")
      .select("id, author_id, helped_count, is_removed, created_at"),
    db.from("saved_schemes").select("scheme_id, user_id, created_at"),
    db.from("scheme_doc_checks").select("user_id"),
    db.from("scheme_notes").select("id, is_removed, created_at"),
    db.from("scheme_flags").select("scheme_id, state, resolved, created_at"),
    db.from("reports").select("resolved"),
    db.from("push_subscriptions").select("user_id"),
    db.from("notifications").select("id", { count: "exact", head: true }),
  ]);

  const profiles = (profilesR.data ?? []) as Row[];
  const questionsAll = (questionsR.data ?? []) as Row[];
  const answersAll = (answersR.data ?? []) as Row[];
  const saved = (savedR.data ?? []) as Row[];
  const docChecks = (docChecksR.data ?? []) as Row[];
  const notes = (notesR.data ?? []) as Row[];
  const flags = (flagsR.data ?? []) as Row[];
  const reports = (reportsR.data ?? []) as Row[];
  const push = (pushR.data ?? []) as Row[];

  const questions = questionsAll.filter((q) => !q.is_removed);
  const answers = answersAll.filter((a) => !a.is_removed);
  const liveNotes = notes.filter((n) => !n.is_removed);
  const openFlags = flags.filter((f) => !f.resolved);

  const onboarded = profiles.filter((p) => p.onboarded_at);
  const consented = profiles.filter((p) => p.consented_at);
  const askedIds = questions.map((q) => q.author_id).filter(Boolean);
  const answeredIds = answers.map((a) => a.author_id).filter(Boolean);
  const contributors = new Set([...askedIds, ...answeredIds]);

  const answeredQ = questions.filter((q) => num(q.answer_count) > 0).length;
  const totalAnswerCount = questions.reduce(
    (s, q) => s + num(q.answer_count),
    0,
  );

  const totals = {
    parents: profiles.length,
    onboarded: onboarded.length,
    consented: consented.length,
    verified: profiles.filter((p) => p.is_verified).length,
    questions: questions.length,
    answers: answers.length,
    helpfulVotes: answers.reduce((s, a) => s + num(a.helped_count), 0),
    savedSchemes: saved.length,
    schemeNotes: liveNotes.length,
    pushReach: distinct(push.map((p) => p.user_id)),
    notifications: notifTotal.count ?? 0,
  };

  const growth = {
    parents7: profiles.filter((p) => within(p.created_at, WEEK)).length,
    parents30: profiles.filter((p) => within(p.created_at, 30 * DAY)).length,
    questions7: questions.filter((q) => within(q.created_at, WEEK)).length,
    answers7: answers.filter((a) => within(a.created_at, WEEK)).length,
  };

  const funnel: Slice[] = [
    { key: "signed", label: "Signed up", count: profiles.length },
    { key: "consented", label: "Consented", count: consented.length },
    { key: "onboarded", label: "Finished onboarding", count: onboarded.length },
    { key: "asked", label: "Asked a question", count: distinct(askedIds) },
    { key: "answered", label: "Answered a peer", count: distinct(answeredIds) },
  ];

  const engagement = {
    answerRate: questions.length
      ? Math.round((answeredQ / questions.length) * 100)
      : 0,
    unanswered: questions.length - answeredQ,
    avgAnswers: questions.length
      ? Number((totalAnswerCount / questions.length).toFixed(1))
      : 0,
    contributors: contributors.size,
    activation: onboarded.length
      ? Math.round((contributors.size / onboarded.length) * 100)
      : 0,
  };

  const ages = profiles
    .map((p) => p.child_age)
    .filter((a): a is number => typeof a === "number");
  const cohort = (lo: number, hi: number) =>
    ages.filter((a) => a >= lo && a <= hi).length;
  const topicCount = (t: string) =>
    questions.filter((q) => q.topic === t).length;

  const roadmap = [
    {
      surface: "Therapist & clinic directory",
      demand: topicCount("therapy") + topicCount("diagnosis"),
      basis: "questions tagged therapy or diagnosis",
    },
    {
      surface: "Special-school finder",
      demand: cohort(4, 18) + topicCount("school-inclusion"),
      basis: "school-age children (4–18) + school questions",
    },
    {
      surface: "Respite & long-term care homes",
      demand: cohort(16, 200),
      basis: "children 16+ nearing adulthood",
    },
    {
      surface: "Guardianship & after-us planning",
      demand: topicCount("future-planning") + topicCount("legal-rights"),
      basis: "questions on future planning or legal rights",
    },
  ].sort((a, b) => b.demand - a.demand);

  return {
    generatedAt: new Date().toISOString(),
    totals,
    growth,
    funnel,
    engagement,
    weekly: {
      parents: weekly(profiles.map((p) => p.created_at)),
      questions: weekly(questions.map((q) => q.created_at)),
      answers: weekly(answers.map((a) => a.created_at)),
    },
    demand: {
      conditions: topSlices(questions, "condition", conditionLabel),
      topics: topSlices(questions, "topic", topicLabel),
      states: topSlices(questions, "state", stateLabel),
      ageBands: topSlices(questions, "age_band", ageBandLabel, 5),
      parentConditions: topSlices(profiles, "condition", conditionLabel),
    },
    benefits: {
      topSaved: topSlices(
        saved,
        "scheme_id",
        (id) => getScheme(id)?.name ?? id,
      ),
      activeClaimers: distinct(docChecks.map((d) => d.user_id)),
      docChecks: docChecks.length,
      notes: liveNotes.length,
      openFlags: openFlags.length,
      flagStates: topSlices(openFlags, "state", stateLabel, 5),
      flagSchemes: topSlices(
        openFlags,
        "scheme_id",
        (id) => getScheme(id)?.name ?? (id || "Missing scheme"),
      ),
    },
    content: {
      unansweredOldest: questions
        .filter((q) => num(q.answer_count) === 0)
        .sort(
          (a, b) =>
            new Date(iso(a.created_at) ?? 0).getTime() -
            new Date(iso(b.created_at) ?? 0).getTime(),
        )
        .slice(0, 8)
        .map((q) => ({
          id: String(q.id),
          title: String(q.title),
          condition: conditionLabel(iso(q.condition)) || "—",
          ageDays: Math.floor(
            (Date.now() - new Date(iso(q.created_at) ?? 0).getTime()) / DAY,
          ),
        })),
      removedQuestions: questionsAll.filter((q) => q.is_removed).length,
      removedAnswers: answersAll.filter((a) => a.is_removed).length,
    },
    moderation: {
      openReports: reports.filter((r) => !r.resolved).length,
      openFlags: openFlags.length,
    },
    roadmap,
  };
}
