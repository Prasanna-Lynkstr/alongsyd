# Auth email templates

Alongsyd's auth emails are sent by **Supabase Auth**, and the templates live in
the Supabase dashboard (not in the running app). These files are the source of
truth — edit them here, then paste into the dashboard.

## Files

| File | Dashboard template | Suggested subject |
| --- | --- | --- |
| `magic-link.html` | Authentication → Emails → **Magic Link** | `Your Alongsyd sign-in link` |
| `confirm-signup.html` | Authentication → Emails → **Confirm signup** | `Confirm your email to join Alongsyd` |

Both templates are needed: `signInWithOtp` (in `src/app/login/page.tsx`) sends
**Confirm signup** to brand-new addresses and **Magic Link** to returning ones.

## How to update

1. Edit the `.html` file here.
2. Dashboard → Authentication → Emails → pick the template → paste into the
   **Message body (HTML)** field → set the subject → Save.
3. Set the **sender name** to `Alongsyd` and the **sender email** to an address
   on your authenticated domain (see below).

Both templates use `{{ .ConfirmationURL }}`, which is correct for our PKCE flow
(the link resolves to `/auth/callback`). Don't swap in `{{ .Token }}` /
`{{ .TokenHash }}` unless you also change the auth call — see
`src/app/auth/confirm/route.ts` for the token-hash path.

## Deliverability (why these were landing in junk)

A pretty template alone won't keep you out of spam. Gmail/Yahoo require an
**authenticated sending domain**. Before/alongside these templates:

1. Configure **custom SMTP** (Resend, Postmark, SES, …) in Authentication →
   Emails → SMTP Settings. The built-in Supabase sender is test-only and gets
   junked.
2. Send from an address on a domain you control (e.g. `no-reply@mail.lynkstr.com`)
   with **SPF, DKIM, and DMARC** DNS records verified at your provider.
3. Raise the auth **rate limits** once custom SMTP is on.
4. Test a real magic link through <https://www.mail-tester.com> — aim for 9–10/10.
