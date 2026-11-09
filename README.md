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
*   `frontend/.env.local`: locally set `NEXT_PUBLIC_API_URL="http://localhost:3001/api"`.

### Step 2: Run manually (two terminals)
**Terminal 1 (Backend):**
*   `cd backend`
*   `pnpm install`
*   `npx prisma generate`
*   `npx prisma migrate deploy` (NEVER `db push`, see notes)
*   `node seed-letters.mjs` (seeds the 3 letter templates)
*   `npm run start:dev` (http://localhost:3001)

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
2. **2FA (TOTP) for staff.** `otplib` + `qrcode`, secrets stored per
   account (`totpSecret`, nullable), 8 hashed recovery codes generated at
   activation, challenge step before the JWT is issued on login.
   Phase 1 scope: staff accounts only; CLIENT accounts excluded.
3. **Known debt to pair with 2FA:** the SSE inbox stream currently
   authenticates via `?token=` query param (EventSource cannot set
   headers). Upgrade candidate: single-use stream tickets exchanged for
   the JWT, to keep tokens out of access logs.
