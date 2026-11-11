# Handoff 015 - 2FA phase 2, ops recovery, lesson hardening

Date: 2026-11-11 (night session). HEAD at end of cycle: see git log
(commits 80311db backend, c711f72 login step, a91851d 2FA panel, plus docs).

## Delivered

1. **2FA phase 2 backend (80311db)**: RecoveryCode table (migration
   20261111200000_add_recovery_codes, bcrypt-hashed), activateTotp
   issues 8 codes (xxxxx-xxxxx) served exactly once, re-activation
   rotates the batch; loginWithTotp accepts TOTP or one unused recovery
   code with atomic consumption (updateMany where usedAt is null,
   count check).
2. **Login 2FA step (c711f72)**: login detects twoFactorRequired +
   challenge and swaps to a code step redeeming at POST /auth/2fa/login;
   session persisted identically to normal login (token, user,
   refreshToken). Nobody can be locked out by activating 2FA anymore.
3. **Settings panel (a91851d)**: TwoFactorPanel with qrcode.react QR,
   manual secret fallback, one-time recovery-code screen with copy
   button and lock-out warning.

## Live verification (local, against real DB, temp staff account
created and purged with row counts)

- setup -> activate returns exactly 8 codes; garbage code -> 401;
  valid TOTP -> 201; first recovery use -> 201; recovery reuse -> 401;
  second garbage -> 401; a different code still -> 201 (batch intact);
  purge leaves 0 rows.

## Incidents and fixes (all captured as Lessons 17-19)

- **Guard regression**: the first R2 patch silently removed the
  if-not-ok throw in loginWithTotp; every code was accepted. Caught by
  the negative smoke case, fixed before anything shipped.
- **History expansion**: pasted exclamation marks corrupted blocks
  ("event not found"); gate-0 + set +H adopted.
- **Watcher zombies + pooler**: four stale watchers each held a
  connection pool against the Supabase transaction-mode pooler
  (port 6543) causing intermittent P1001 boots. Fixed: census+kill,
  one backgrounded watcher with log (/tmp/watch-boot.log), local
  DATABASE_URL switched to session mode (5432). Check Render: if its
  DATABASE_URL uses 6543, switch it too.

## Out of the cycle / owner follow-ups

- 2FA staff rollout (visual check: dev frontend + real authenticator).
- Render: confirm/rotate JWT_SECRET; ADMIN_NOTIFY_EMAIL; verify
  DATABASE_URL port; SUPABASE_URL real vs mock (document-loss risk).
- Orphan audit (backlog 015 item 2) still blocked on Render/Vercel/DNS
  inventory.
- Candidates: dedicated local dev database (local scripts still hit the
  PRODUCTION Supabase); remove the duplicate package-lock.json in
  frontend/ (pnpm is the working manager; dual lockfiles invite drift).
- pre-ea8b6b0 sessions expire naturally within 24h of that deploy.
