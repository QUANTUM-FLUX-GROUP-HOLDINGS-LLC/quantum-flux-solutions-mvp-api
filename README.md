# Quantum Flux Solutions - Fintech MVP

Monorepo for Credit Repair, Taxes (Personal & Business), and Bookkeeping services (U.S. Only).

## Architecture (READ FIRST)
This project follows a **Feature-Driven Architecture**.
*   `backend/`: NestJS with separate modules (`src/credit`, `src/letters`,
    `src/tax-business`, etc.). Prisma ORM.
*   `frontend/`: Next.js (Pages Router).
    *   `src/pages/`: Only thin ~9-line wrappers for routing.
    *   `src/modules/`: All business logic, components and CSS per module.
    *   **GOLDEN RULE:** No monolithic files. To change the Tax Business view,
        edit `src/modules/tax-business/`.

## Getting started from scratch

### Prerequisites
*   Node.js (v20+), pnpm, Git
*   A PostgreSQL database (Supabase)

### Step 1: Environment variables
*   `backend/.env`: real Supabase `DATABASE_URL` (and Stripe keys).
*   `frontend/.env.local`: locally set `NEXT_PUBLIC_API_URL="http://localhost:3000/api"`.

### Step 2: Run manually (two terminals)
**Terminal 1 (Backend):**
*   `cd backend`
*   `pnpm install`
*   `npx prisma generate`
*   `npx prisma migrate deploy` (NEVER `db push`, see notes)
*   `node seed-letters.mjs` (seeds the 3 letter templates)
*   `npm run start:dev` (http://localhost:3000)

**Terminal 2 (Frontend):**
*   `cd frontend`
*   `pnpm install`
*   `npm run dev` (http://localhost:3000)

## Authentication model
A single unified login page (`/login`) serves every role:
*   `CLIENT` accounts land on `/dashboard` (client portal).
*   Staff roles (`ADMIN`, `CREDIT_REPAIR`, ...) land on `/admin/dashboard`.
*   The former `/staff-login` page was removed; `/admin/*` routes still block
    CLIENT accounts (the route guard signs them out).
*   Sessions use a 15-minute access JWT plus a rotating opaque refresh
    token (30 days, stored SHA-256-hashed). `apiFetch` refreshes silently
    on 401; logout revokes the refresh chain server-side; reusing an
    already-rotated refresh token revokes every session of that user
    (theft detection). Legacy 1d tokens expire naturally after deploy.

## Test data (development only)
`prisma/seed.ts` creates local dev users with password `password123`
(`admin@test.com`, `credit@test.com`, `client1@test.com`, ...). These accounts
DO NOT exist in production - the production database is kept clean
(only the real admin account + seeded letter templates).

## Notes for developers / AI agents
1.  **Schema changes:** update `schema.prisma`, hand-author the migration SQL,
    apply with `npx prisma migrate deploy`. Do NOT use `prisma migrate dev`
    against Supabase (pooled `directUrl` breaks the shadow database) and do NOT
    use `db push` (bypasses migration history). Update `prisma/seed.ts`.
2.  **Inspect the schema before writing DB scripts:** run
    `grep '^model' prisma/schema.prisma` first. Wrap destructive scripts in a
    Prisma `$transaction` so failures roll back cleanly.
3.  **Typecheck before committing:** chain commands
    (`npx tsc --noEmit && git commit ...`).
4.  **Isolation:** new UI components belong in `src/modules/[module]/components/`.
5.  **Environment variables:** never commit `.env` files; keep `.example` files
    up to date.
6.  **Language:** repository code, comments and docs are English-only.

## Uploads lifecycle

- Documents upload through `POST /documents` (10MB max, PDF/PNG/JPEG only).
  A `Document` row is created and the bytes go to `SupabaseService` — a
  dual-mode service: real Supabase Storage when `SUPABASE_URL` /
  `SUPABASE_SERVICE_ROLE_KEY` are set, local `uploads/` disk otherwise
  (mock mode). Despite the name, it is the storage abstraction, not a
  Supabase-only client.
- In mock mode the DB `storagePath` keeps the logical
  `customerId/timestamp-rand.ext` form, while on disk slashes are
  flattened to underscores. Delete and audit paths replicate this.
- Files on the local disk are EPHEMERAL on Render: every deploy or restart
  wipes `uploads/`, leaving rows whose file no longer exists. Production
  should configure real Supabase Storage so documents survive deploys
  (tracked as roadmap).
- `DELETE /documents/:id` deletes the row first, then the file
  (best-effort), restricted to the owner or an ADMIN.
- `backend/audit-uploads.mjs` is a read-only audit: rows missing their
  file, and disk files without a row. It never deletes data.

## Security roadmap

Agreed order of implementation (decided 2026-11-09):

1. **Temporary staff passwords.** Admin generates a one-time 16-char
   temporary password; the account must rotate it on next login
   (`mustChangePassword` flag + change endpoint). Replaces the manual
   terminal reset runbook. Prerequisite for 2FA rollout.
2. **2FA (TOTP) for staff.** PHASE 1 DELIVERED (commit f7a1306,
   2026-11-10): `otplib` 12.0.1 (pinned; v13 dropped the `authenticator`
   export), `totpSecret`/`totpConfirmed` columns on Customer, staff-only
   enrollment via `POST /auth/2fa/setup` returning an `otpauth://` URI,
   activation with a first valid code, and a short-lived `2fa-challenge`
   JWT before the session is issued. Verified E2E locally against the real
   DB (temp staff account, purged and counted afterwards).
   PHASE 2 DELIVERED (2026-11-11, commits 80311db + c711f72 + a91851d):
   QR rendering in admin settings (qrcode.react), eight single-use
   recovery codes (bcrypt-hashed, served exactly once at activation,
   re-activation rotates the batch, atomic consumption), and the frontend
   UI (verification step on login + setup panel). A patch silently
   dropped a guard and loginWithTotp briefly accepted any code; the
   negative smoke case (garbage code -> 401) caught it live and the fix
   landed before anything shipped. Remaining (owner): staff rollout;
   the manual Super Admin runbook stays the recovery path of last
   resort if both the authenticator and all codes are lost.
3. **SSE stream auth (?token= debt): RETIRED** (2026-11-10, commit
   e422bb3). The inbox stream now exchanges the Bearer JWT for a
   single-use, 30s ticket via POST /messages/stream-ticket
   (JwtAuthGuard); GET /messages/stream redeems ?ticket= exactly once
   (sse-tickets.service.ts, SseAuthGuard). The session JWT never
   travels in URLs. Trade-off accepted: tickets live in process
   memory (single-instance only); a restart just forces clients to
   fetch a fresh ticket on the normal error path.
4. **Session hardening: DELIVERED** (2026-11-11, commits ea8b6b0 +
   170e673).
   Access JWT shortened 1d -> 15m; rotating refresh tokens via the
   RefreshToken table (SHA-256 hashed, 30-day TTL, rotation on every
   refresh; reuse of a rotated token revokes the user's whole chain;
   POST /auth/logout revokes all). No forced logout. Follow-up DELIVERED (commit
   261dbcd): JWT_SECRET fallbacks removed; the backend refuses to boot
   without it (fail-fast in main.ts bootstrap). REMAINING (owner):
   confirm JWT_SECRET is set in Render, and rotate the secret at least
   once (assume the shipped fallback was compromise-eligible).

### Staff recovery escalation (2026-11-09)

Staff (non-CLIENT) forgot-password attempts are now escalated by email to
`ADMIN_NOTIFY_EMAIL` so the admin can issue a temporary password per the
runbook (`docs/runbooks/staff-password-recovery.md`). Set
`ADMIN_NOTIFY_EMAIL` in Render (e.g. support@quantumfluxsolutions.com);
without it the attempt is only logged. The endpoint response stays
identical for all users (anti-enumeration).

### Patch-script lessons (cycles 013-015 incidents)

- Lesson 11: an anchor must never span more than one functional brace;
  if it includes a brace belonging to prior code, the replacement must
  give that brace back explicitly (broken mail.service.ts, fixed c6ab07c).
- Lesson 12: long pasted command chains fragmented during this cycle; a
  commit ran despite tsc failing. Verification (tsc) and commit are now
  separate commands run one block at a time until output is confirmed.
- Lesson 13: when building an anchor from sed/cat output, count the
  exact leading spaces (a 6-vs-4 space indent caused the first repair
  attempt to ABORT; the anchor must be copied verbatim from the output).
- Lesson 14: a red gate aborts the ENTIRE planned chain, not just its own
  block. No later block runs until the red is triaged and either fixed or
  explicitly justified (cycle 014: commit block ran while the preceding
  residue gate was red; e422bb3 was benign only by luck and had to be
  re-validated post-hoc).
- Lesson 15: residue gates must target the exact retired symbol
  (`stream?token=`, `getAuthToken`), never broad patterns that also match
  documenting comments or legitimate sibling flows such as the
  password-reset email link.
- Lesson 16: commit blocks must re-run the gates INLINE
  (`tsc && git add && git commit`), making a red push physically
  impossible. This cycle breached L14 twice (Block H after a red Block
  F published the incomplete ea8b6b0, fixed forward immediately).
- Lesson 17: diff old vs new line by line when replacing a block. A
  silently dropped guard (if-not-ok throw) let loginWithTotp accept ANY
  code, making 2FA decorative. Auth smokes MUST include negative cases
  (garbage code -> 401, recovery reuse -> 401) alongside the positives;
  that is what caught the hole, before anything shipped.
- Lesson 18: interactive bash history expansion corrupts pasted
  exclamation marks even inside quoted heredocs ("event not found"),
  mangling the patch before Python ever sees it. Every block now ships a
  gate-0 (abort if H is in the shell options) and runs after set +H;
  when the character is unavoidable in text, generate it via printf or
  chr(33) instead of pasting it literally.
- Lesson 19: local-ops hygiene, from a night of EADDRINUSE/P1001:
  (a) census and kill ALL watchers before booting one (four zombies had
  piled up, each holding its own connection pool); (b) against the
  Supabase pooler, Prisma must use session mode (port 5432), never
  transaction mode (6543); (c) EXIT traps must delete tmp files as well
  as DB rows (a crashed block left backend/tmp-diag.mjs behind; the
  exact-tree gate caught it before the commit).
