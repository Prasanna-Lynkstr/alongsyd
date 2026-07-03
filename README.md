# Alongsyd

**Alongside you, the whole way.** A mobile-web PWA piloting an ask-and-answer
community for special-needs parents in India — ask a real, specific question and
get a trustworthy answer from parents who solved the same thing. Answers are
kept, tagged and searchable. It also has a standalone, no-login **benefits /
scheme-eligibility checker** for Indian disability schemes.

Full product spec: [`SPEC.md`](./SPEC.md).

---

## Architecture (the seam that matters)

- `src/engine/*` — the **generic Q&A engine** (auth, tagging, search, storage,
  moderation nudges). Vertical-agnostic.
- `src/config/*` — the **special-needs config**: `taxonomy.ts` (tags),
  `schemes.json` (baseline benefits), `seed-questions.json` (starter content),
  `welcome.ts` (onboarding copy).
- A second vertical later should be a **config swap, not a rewrite.**

Stack: Next.js (App Router) + TypeScript + Tailwind v4 + Supabase (auth +
Postgres). Installable PWA. Deploys to Vercel.

---

## Setup

1. **Create a Supabase project** (free tier) at [supabase.com](https://supabase.com).
2. **Create the database:** open the Supabase **SQL editor**, paste the contents
   of [`supabase/schema.sql`](./supabase/schema.sql), and run it. (Safe to re-run.
   It includes semantic search + push tables; if you set the DB up earlier, run
   the add-on files [`supabase/semantic-search.sql`](./supabase/semantic-search.sql)
   and [`supabase/push.sql`](./supabase/push.sql).)
3. **Environment:** copy `.env.example` → `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
     `SUPABASE_SERVICE_ROLE_KEY` (secret) — from Supabase → *Project Settings → API*
   - `OPENAI_API_KEY` (secret) — from [platform.openai.com](https://platform.openai.com/api-keys),
     powers semantic search. Optional: without it, search falls back to keyword-only.
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` + `VAPID_SUBJECT` —
     enable Web Push "your question was answered" notifications. Generate a pair:
     `node -e "console.log(require('web-push').generateVAPIDKeys())"`. Optional:
     without them the notification opt-in is hidden. (iOS delivers push only when
     the PWA is installed to the home screen.)
4. **Auth providers** (Supabase → *Authentication → Providers*):
   - **Email magic-link** is the only sign-in method by default, and works
     immediately.
   - **Phone (OTP)** is built but disabled. To turn it on: configure an SMS
     provider (e.g. Twilio / MSG91) in Supabase, then set
     `NEXT_PUBLIC_PHONE_AUTH=true`. No other code change.
   - Add your dev + prod URLs under *Authentication → URL Configuration →
     Redirect URLs* (e.g. `http://localhost:3000/auth/callback` and
     `https://your-app.vercel.app/auth/callback`).
   - **Email delivery:** Supabase's built-in sender is rate-limited (a few/hour)
     and for testing only. For a real pilot, set a custom SMTP provider under
     *Authentication → Emails → SMTP Settings* (e.g. ZeptoMail, Resend, SES) so
     magic links actually reach parents.
5. **Use Node 22+** (required — `@supabase/supabase-js` needs a native
   `WebSocket`, which Node 20 lacks). With nvm: `nvm install 22 && nvm use 22`
   (there's an `.nvmrc`, so `nvm use` picks it up). Vercel already uses Node 22.
6. **Install & seed & run:**
   ```bash
   pnpm install
   pnpm seed      # loads the 16 starter Q&As + a few scheme notes
   pnpm embed     # generates semantic-search embeddings (needs OPENAI_API_KEY)
   pnpm dev       # http://localhost:3000
   ```

---

## How to… (the three things you'll actually do)

### Add / verify a "verified" user (expert or veteran parent)
Verified users get a badge on their answers. Two ways:

- **In-app (easiest):** make yourself an admin once (below), then open **Admin**
  in the bottom nav → **Parents** → tap **Verify** next to anyone.
- **Directly:** in the Supabase SQL editor:
  ```sql
  update public.profiles set is_verified = true where alias = 'TheirAlias';
  ```

**Make someone an admin** (admins see the Admin tab and can verify/remove):
```sql
update public.profiles set is_admin = true where alias = 'YourAlias';
```
(Users can never make themselves verified/admin — a DB trigger blocks it; only
this SQL or the service-role key can.)

### Add or edit seed Q&A content
Edit [`src/config/seed-questions.json`](./src/config/seed-questions.json) — each
entry is a question with tags + nested answers (see the shape already there;
**never** include a child's name). Then re-run:
```bash
pnpm seed
```
Re-running **replaces** the seed-authored content and leaves real parents' posts
untouched.

### Add or edit schemes (benefits baseline)
Edit [`src/config/schemes.json`](./src/config/schemes.json). Each scheme has
`eligibility` (conditions / age / disability %), `claimSteps`, `documents`,
`officialLink`, and `appliesToStates` (`["*"]` = all, or 2-letter state codes).
No database or redeploy of data needed — the app reads the file. Bump
`lastReviewed` when you revise it. Parent-contributed **notes** and **flags**
(missing/wrong-for-my-state) arrive via the app and appear in **Admin → Scheme
flags**.

---

### Add a new market (country)
Alongsyd is single-country per deployment, but the country is one config seam:
1. Add a country block in [`src/config/country.ts`](./src/config/country.ts)
   (code, regions, dial code, currency, benefits framing) — there's a `US`
   example to copy.
2. Provide that market's **content packs** (data, not code): its
   `src/config/schemes.json` and `src/config/seed-questions.json`.
3. Set `NEXT_PUBLIC_COUNTRY=<code>` in the environment.

The engine (auth, Q&A, search, tagging) is geography-neutral — the region list,
phone dial code, currency, and benefits copy all flow from the active country.

---

## Deploy (Vercel)

1. Push this repo to GitHub and import it in Vercel.
2. Add the same three env vars (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) in Vercel →
   *Settings → Environment Variables*.
3. Add the deployed `…/auth/callback` URL to Supabase redirect URLs (step 4 above).
4. Deploy. The app is installable — "Add to Home Screen" on mobile.

---

## What's intentionally NOT built
AI/chatbot answers, real-time chat, group threads, marketplace, payments, a
records timeline, a native app, and push notifications. See `SPEC.md → Out of
scope`.

## A note on the scheme data
`schemes.json` was compiled from public government sources and is general
guidance — rules vary by state/district and change. The UI always separates the
**official baseline** from **parent experiences**, and every result carries a
"confirm with the authority" disclaimer. Keep it reviewed.
