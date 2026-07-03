# Alongsyd — Product & Build Spec

> Single source of truth. Re-read before each major step. Update this file if we change direction.

## What we're building

Alongsyd — a mobile-web PWA piloting an ask-and-answer community for special-needs
parents in India. Goal: ship something usable to 20–50 parents fast. **Not built for scale.**

Tagline (shown under the logo throughout): **"For every step, and the ones after"**

## Product

Ask a real, specific question about your special-needs child, get a trustworthy answer
from parents who solved the same thing. Answers are kept, tagged, searchable. **The
community remembers; that's the product.**

Framing: Alongsyd is a *companion for the whole journey*, not a single app. The Q&A
surface is one named section ("Ask" / "Community"), signalling it's one part of a
larger roadmap (Diagnosis · School years · Adulthood · After-us).

## Architecture — the seam that matters

Keep folders clean. Separate:

- **Generic Q&A engine** (`src/engine/*`): capture → tag → store → search → seed-route
  → consent. Vertical-agnostic.
- **Special-needs config** (`src/config/*`): taxonomy, seed content, scheme rules. Data,
  not code.
- **Country config** (`src/config/country.ts`): the active market — regions (states),
  dial code, currency, benefits framing. One deployment = one country; adding a market
  is a country block + `NEXT_PUBLIC_COUNTRY` + that market's scheme/seed content.

A second vertical later should be a **config swap, not a rewrite.**

### Stack
- Next.js (App Router) + TypeScript + Tailwind
- Supabase (free tier) — auth (phone OTP + magic-link fallback) + Postgres
- PWA: manifest + service worker, installs to home screen
- Deploy: Vercel

## Identity — a safe second identity, not a real-name profile

- Phone-based OTP signup; **magic-link (email) fallback**.
- Parent picks an **avatar + display alias**. No real names anywhere.
- **Never collect or store the child's name.** No name field exists in schema or UI. In
  questions the child is referred to only by age + condition (e.g. "my 6-yr-old,
  autism"). Enforce a soft check in the compose UI.
- Phone numbers used only for auth — **never displayed or exposed to other users.**

## Core loop

1. Signup: phone OTP (or magic-link) → pick avatar + alias → child's condition, age,
   city → consent screen.
2. Post a question; auto-tag by condition / age-band / city, optional topic tag.
3. Feed of questions, newest first, filterable by tag.
4. **Search** across all Q&A, top of screen — search is first-class. **Hybrid:**
   semantic (pgvector embeddings, OpenAI `text-embedding-3-small`) matches by
   meaning, merged with keyword full-text search for exact terms. Degrades to
   keyword-only if no embeddings key is set. This is search *infrastructure* —
   answers are still written by humans (see Out of scope).
5. Any parent or a **verified** user (expert/veteran) can answer; verified answers badged.
6. **"This helped"** button + count; sort answers by it.
7. Answers are permanent and searchable.

## Constructive community — build in, don't bolt on

- **Seed 15–20 real Q&As** before launch so first-timers land in a warm, already-helpful
  space, never an empty room.
- **Guided posting:** composing an answer shows a gentle prompt nudging supportive
  phrasing ("share what worked for you, kindly"). Warm placeholders throughout.
- **Positive reactions only.** No downvotes. Report button + admin removal for harmful
  content.
- Whole-UI tone: calm, encouraging, parents supporting parents.

## Scheme-eligibility checker — standalone, no login, crowd-powered

- Entry page (**no auth required**): condition + age + state dropdowns → applicable
  Indian benefits (disability certificate, UDID, Niramaya, tax relief) + claim steps.
- **Two stacked sources, visually separated:**
  1. **Baseline config** (editable JSON) — known national schemes. Authoritative.
     Prevents cold-start empty room.
  2. **Crowd contributions** — per-scheme "parent notes", tagged by state/district: real
     claiming tips, timelines, rejection reasons, local quirks.
- After results, prompt: *"Did this apply to you? What helped?"* → feeds crowd notes.
- Parents can **flag a scheme as missing/wrong** for their state → routes to
  admin/verified to confirm and add.
- **UI must clearly separate** the official baseline rule from parent experience notes —
  a wrong claim wastes weeks, so parents need to know which is which.
- Ends with a signup prompt.

## Trust — non-negotiable

- **Consent screen at signup:** conversations may be used in **anonymised** form to
  improve the platform; individual messages stay private.
- Admin flag to mark verified users and remove content.

## Onboarding (before feed, shown once)

- One-time **welcome screen** with lifelong-companion + crowd-intelligence framing (copy
  below).
- A greyed-out **journey strip**: Diagnosis · School years · Adulthood · After-us — first
  marked "you're here," rest marked "coming." Non-interactive, illustrative only.

### Welcome copy (verbatim)

> **Welcome to Alongsyd — You're not meant to walk this alone.** Alongsyd is a companion
> for the whole journey — from diagnosis through the years ahead, including the questions
> no one else talks about. It runs on the lived wisdom of parents who've walked this road
> before you: every question asked and answered makes it smarter for the next family.
> You're not just getting help — you're building it, alongside each other. For now, start
> simple. Ask what's on your mind.

## UI

Calm, minimal — closer to a clean notes app than a social feed. Mobile-first, single
column, large tap targets. Name the Q&A surface "Ask" / "Community", never the whole app.

## Out of scope — do NOT build

AI/chatbot **answers**, real-time chat, group threads, marketplace, payments,
records timeline, native app. (Notes: semantic *search* via embeddings is in
scope — discovery infrastructure, not machine-generated answers. **Web Push**
notifications were added post-spec as the core "your question was answered"
retention loop — on iOS they require the PWA to be installed to the home screen.)

## Content lives in editable config (not hardcoded)

- Seed Q&As → JSON (`src/config/seed-questions.json`)
- Scheme baseline rules → JSON (`src/config/schemes.json`)
- Tag taxonomy (conditions, age bands, topics) → config (`src/config/taxonomy.ts`)

So content grows without code changes.

## Build order (ship each working before the next)

1. Auth + identity
2. Question / answer loop
3. Search
4. Scheme checker
5. Seed data
6. Consent / admin

## Deliverables

- Deployed URL (Vercel)
- Seed script loading starter Q&As + baseline schemes
- One-page README: how to add verified users, seed content, and schemes
