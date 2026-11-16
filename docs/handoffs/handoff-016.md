# Handoff 016 - Render ops recovery, secret rotation, DB credentials fix

Date: 2026-11-14. HEAD unchanged: 763acf5 (no code shipped this cycle;
pure ops/config session against the 015 follow-up list).

## Resolved this cycle (015 owner follow-ups, mostly DONE)

1. **Root cause of "Failed" deploys identified and fixed**: the Supabase
   DB password had been rotated (and the project briefly paused), so
   local .env and Render credentials were stale. Symptoms: P1001
   ("can't reach") from sleep, then P1000 (auth) once awake. Note the
   trap: the shared pooler accepts TCP even when the project is
   paused, so `nc` succeeds while real connects fail.
2. **DB password reset via Supabase**; `DATABASE_URL` and `DIRECT_URL`
   updated in BOTH Render and `backend/.env`. Both strings are Session
   Pooler **:5432** (watch out: the Supabase connect dialog defaults
   to the Transaction Pooler tab (:6543) - pasting from the wrong tab
   reintroduces the P1001 instability from handoff 015).
3. **Migration 20261111200000 (RecoveryCode) confirmed APPLIED in
   production**: `prisma migrate status` -> 7 migrations, "Database
   schema is up to date!"; `RecoveryCode` table exists, 0 rows
   (expected, nobody activated 2FA yet).
4. **JWT_SECRET rotated in Render** (openssl rand -base64 48). Active
   sessions invalidated on redeploy (expected).
5. **Render env audit complete**: `DIRECI_URL` typo renamed to
   `DIRECT_URL`; `ADMIN_NOTIFY_EMAIL=support@quantumfluxsolutions.com`
   present; `SUPABASE_URL` is the REAL project URL (mock-storage
   document-loss risk CLOSED).
6. **Backend Live in Render**: deploy succeeded Nov 13, 22:31 EST,
   commit 763acf5. Real service URL: https://quantum-flux-api-npru.onrender.com
   (not the bare quantum-flux-api.onrender.com - that resolves to
   x-render-routing: no-server).
7. **Local hygiene**: root and frontend/package-lock.json deleted
   (untracked; pnpm is the manager, dual lockfiles invite drift);
   backend/.env header comment corrected (Session Pooler 5432);
   tmp-dbtest.mjs / tmp-check.mjs diagnostic scripts removed.

## Security incident (handled, but record it)

Three secret values crossed a chat session (a generated-but-unused
JWT, the new DB password via screenshot, the old production
JWT_SECRET via screenshot). ALL were rotated afterwards: JWT_SECRET
twice-generated/final one never shared, DB password reset one last
time through official dialogs. Rule going forward: NEVER paste
secret values or screenshots of secret panels into chat; redacted
extracts (variable names, port numbers) only.

## Known platform behavior (new this cycle)

- Render free tier sleeps after ~15 min idle; first request pays a
  50-90s cold start ("SERVICE WAKING UP"). Health-check style curl
  right after idle periods will hang briefly - retry after sleep 60.

## Out of the cycle / owner follow-ups

- **FINAL health check**: `curl https://quantum-flux-api-npru.onrender.com/api/health`
  (expect 200/JSON). Was mid-verification when session ended.
- **Eyeball-confirm Render DATABASE_URL/DIRECT_URL ports** with the
  visibility toggle: must be :5432. If :6543 slipped in during the
  password update, switch (same value, fix the port) and redeploy.
- **Staff 2FA rollout** (visual check: dev/production frontend + real
  authenticator app). Backend ready: routes mapped, table in prod.
- **Orphan audit unblocked**: inventory now known - Render
  quantum-flux-api-npru / Vercel quantum-flux-solutions-mvp-api
  (Ready, domain quantum-flux-solutions-mvp-api.vercel.app) /
  Supabase project ref ucdixkhzgxsynhcyiwxh / Resend (deliveries OK,
  2 expected bounces on test addresses). Run backlog 015 item 2.
- **Candidates**: dedicated local dev DB (local still hits PRODUCTION
  Supabase - highest remaining risk); cold-start mitigation (uptime
  ping or paid tier) if staff demo sessions suffer from spin-up lag.
- pre-ea8b6b0 sessions: expired naturally by now (24h+ since deploy).
