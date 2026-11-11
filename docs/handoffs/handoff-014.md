# Handoff 014 — SSE ticket + session hardening cycle (2026-11-10/11)

Repo: quantum-flux-solutions-mvp-api (backend Render, frontend Vercel).
Status: backlog 014 items 3 and 4 delivered; item 2 blocked on owner
inputs; E2E post-deploy pending (below).

## Delivered this cycle

1. SSE ?token= debt RETIRED — commits e422bb3 (code) + be3a8f3 (docs).
   POST /messages/stream-ticket (JwtAuthGuard) exchanges the Bearer JWT
   for a single-use 30s ticket (sse-tickets.service.ts, in-memory);
   GET /messages/stream redeems ?ticket= exactly once (SseAuthGuard).
   Client refetches a ticket per (re)connect with backoff; polling
   fallback preserved; getAuthToken export removed.
2. Session hardening — commits ea8b6b0 (core) + 170e673 (fix-forward)
   + 23ba641 (docs). Access JWT 1d -> 15m; RefreshToken table
   (migration 20261111190000_add_refresh_token, SHA-256 hashed, 30-day
   TTL); rotation on every refresh; reuse of a rotated token revokes
   the user's whole chain; POST /auth/logout revokes all; apiFetch
   performs one silent refresh+retry on 401 (shared in-flight promise);
   signOut fires best-effort /auth/logout. No forced logout: legacy 1d
   tokens expire naturally within 24h of deploy.
3. Lessons 14-16 added (README "Patch-script lessons (cycles 013-014)"):
   L14 red gate aborts the whole chain; L15 scoped residue gates;
   L16 commit blocks must run gates inline (tsc && add && commit).

## Incidents (both recovered same session, recorded)

1. Residue gate too broad (block 3): matched documenting comments and
   the legitimate password-reset email link. Chain continued despite
   the red (L14 breach #1); e422bb3 validated post-hoc, benign.
2. Stale import anchor (block F): anchor built from plan, not from the
   file (the c4ade40 storage import already carried getSessionToken).
   Abort left auth-context.tsx intact, but block H ran anyway and
   published incomplete ea8b6b0 (login did not persist refreshToken;
   sessions would die at 15m). Fixed forward in 170e673. Both breaches
   drove Lesson 16 (inline-gated commits).

## External verifications pending (owner)

- URGENT: confirm/set a real JWT_SECRET in Render; the code still has a
  `super_secret_fallback` (removal candidate, backlog 015).
- Render: add ADMIN_NOTIFY_EMAIL (suggested support@quantumfluxsolutions.com).
- Render: confirm SUPABASE_URL real vs mock (document-loss risk per deploy).
- Orphan audit: paste Render services, Vercel projects and DNS records
  into docs/orphan-audit.md TODOs (verdicts: suspend, observe, delete).

## E2E post-deploy checklist

- SSE: /messages/stream?ticket=... connects <1s; no session JWT in any
  URL; reconnect fetches a fresh ticket; polling after 3 failures.
- Refresh: session survives >15m with silent refresh (DevTools Network:
  a 401 followed by /auth/refresh and a retried call).
- Logout: the refresh token that was active before logout now 401s.
- Reuse of a rotated refresh token 401s and revokes the chain.
- Legacy continuity: a browser with a pre-ea8b6b0 1d session keeps
  working until natural expiry, then re-login.

## Proposed backlog 015

1. Remove the JWT_SECRET fallback: fail fast at boot when unset
   (runtime config check, not a silent default).
2. Close orphan audit once dashboard lists arrive.
3. 2FA TOTP phase 2: QR rendering, 8 hashed recovery codes, staff UI,
   rollout (phase 1 in f7a1306).
