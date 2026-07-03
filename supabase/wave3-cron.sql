-- Alongsyd — Wave 3: scheduled jobs via Supabase pg_cron + pg_net.
--
-- Runs two recurring jobs that POST to bearer-protected app endpoints:
--   • weekly digest       → /api/cron/weekly-digest
--   • renewal reminders   → /api/cron/renewal-reminders
--
-- ── Before running ──────────────────────────────────────────────────────────
--  1. Set CRON_SECRET in the app's environment (a long random string), redeploy.
--  2. In the two cron.schedule calls below, replace:
--       <APP_URL>       → https://alongsyd.lynkstr.com   (no trailing slash)
--       <CRON_SECRET>   → the same value as the app's CRON_SECRET
--     (For production, prefer Supabase Vault over inlining the secret — see the
--      commented Vault variant at the bottom.)
--  3. Run this file in the Supabase SQL editor. Safe to re-run: schedules are
--     unscheduled first.
-- ────────────────────────────────────────────────────────────────────────────

-- Dedup column for renewal reminders (added here so this file is self-contained).
alter table public.saved_schemes
  add column if not exists reminded_at timestamptz;

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Idempotent: remove ANY existing Alongsyd schedules first. We loop
-- cron.unschedule(jobid) (a SECURITY DEFINER function — works even though a
-- direct DELETE on cron.job is denied to normal roles), because the named
-- cron.schedule below appends rather than upserts, and cron.unschedule(name)
-- errors once duplicates exist. Safe when none exist (loops 0 times).
do $$
declare j bigint;
begin
  for j in select jobid from cron.job where jobname like 'alongsyd-%' loop
    perform cron.unschedule(j);
  end loop;
end $$;

-- Weekly digest — Mondays 09:00 UTC.
select cron.schedule(
  'alongsyd-weekly-digest',
  '0 9 * * 1',
  $$
  select net.http_post(
    url     := '<APP_URL>/api/cron/weekly-digest',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <CRON_SECRET>'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- Renewal reminders — daily 09:30 UTC (endpoint is deduped, so daily is safe).
select cron.schedule(
  'alongsyd-renewal-reminders',
  '30 9 * * *',
  $$
  select net.http_post(
    url     := '<APP_URL>/api/cron/renewal-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <CRON_SECRET>'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- Inspect: select * from cron.job;
-- History: select * from cron.job_run_details order by start_time desc limit 20;

-- ── Vault variant (recommended for production) ──────────────────────────────
-- Store the secret once:
--   select vault.create_secret('<CRON_SECRET>', 'alongsyd_cron_secret');
-- Then in each job build the header from the decrypted secret, e.g.:
--   'Authorization',
--   'Bearer ' || (select decrypted_secret from vault.decrypted_secrets
--                  where name = 'alongsyd_cron_secret')
