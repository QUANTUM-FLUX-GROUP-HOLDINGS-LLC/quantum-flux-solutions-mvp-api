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
   NOT yet delivered (phase 2): QR code rendering (URI is copy/manual-entry
   for now), 8 hashed recovery codes, frontend UI screens, and rollout.
   Recovery today: manual Super Admin runbook clears the TOTP columns.
3. **Known debt to pair with 2FA:** the SSE inbox stream currently
   authenticates via `?token=` query param (EventSource cannot set
   headers). Upgrade candidate: single-use stream tickets exchanged for
   the JWT, to keep tokens out of access logs.

### Staff recovery escalation (2026-11-09)

Staff (non-CLIENT) forgot-password attempts are now escalated by email to
`ADMIN_NOTIFY_EMAIL` so the admin can issue a temporary password per the
runbook (`docs/runbooks/staff-password-recovery.md`). Set
`ADMIN_NOTIFY_EMAIL` in Render (e.g. support@quantumfluxsolutions.com);
without it the attempt is only logged. The endpoint response stays
identical for all users (anti-enumeration).

### Patch-script lessons (cycle 013 incidents)

- Lesson 11: an anchor must never span more than one functional brace;
  if it includes a brace belonging to prior code, the replacement must
  give that brace back explicitly (broken mail.service.ts, fixed c6ab07c).
- Lesson 12: long pasted command chains fragmented during this cycle; a
  commit ran despite tsc failing. Verification (tsc) and commit are now
  separate commands run one block at a time until output is confirmed.
- Lesson 13: when building an anchor from sed/cat output, count the
  exact leading spaces (a 6-vs-4 space indent caused the first repair
  attempt to ABORT; the anchor must be copied verbatim from the output).
