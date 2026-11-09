# Handoff 012 — Dispute workflow, letter persistence, unified login

Date: 2026-11-09
Branch: main (deployed: Render backend + Vercel frontend)

## Completed this cycle

1. **Mark as Sent flow (backlog 011 #1)**
   - `PATCH /credit/disputes/:id` accepts `status: 'SENT'` via the forward-only
     state machine (`PENDING -> SENT -> RESOLVED`).
   - Admin table shows a "Mark as Sent" action for PENDING disputes with a
     confirmation dialog. Verified E2E in production.

2. **Letter Library persistence (backlog 011 #2)**
   - Prisma model `LetterTemplate` (unique `bureau`, `title`, `content`).
   - Migration applied manually via SQL + `prisma migrate deploy` (see lessons).
   - New module: `GET /letters`, `PATCH /letters/:id` (roles ADMIN/CREDIT_REPAIR).
   - Idempotent seed: `backend/seed-letters.mjs` (Equifax/Experian/TransUnion).
   - Frontend `LetterLibraryModule` rewritten: loads from API, saves via PATCH,
     dirty-state indicator, no more local-state simulation.

3. **Unified login (decided during E2E verification)**
   - Removed `staff-login.tsx`; a single `/login` handles all roles.
   - Role-based redirect: CLIENT -> `/dashboard`, staff -> `/admin/dashboard`.
   - New `writeSession`/`clearSession` helpers persist the session under BOTH
   storage prefixes (`client_`, `staff_`) so the admin area reads it after the
   redirect (`storage.ts` picks the prefix by route).
   - Route guards in `_app.tsx` retargeted to `/login`; CLIENTs are still signed
     out of `/admin` exactly as before. `/staff-login` now returns 404.

## Incident log: "Invalid email or password" for the admin account

Sequence of findings during verification:
- The deployed frontend calls `https://quantum-flux-api-npru.onrender.com/api`
  (confirmed by inspecting the Vercel JS bundle). The
  `quantum-flux-solutions-mvp-api.onrender.com` host is an orphan domain
  (`x-render-routing: no-server`), NOT our backend - initial curl probes
  against it returned 404 and led debugging astray.
- Password reset executed via the runbook pattern (hidden stdin, bcrypt cost
  10, min length 12). Curl login against the real backend returned 201 + token.
- Browser still showed "Invalid email or password" with HTTP 201: root cause was
  the client-portal login page rejecting any role other than CLIENT with a
  generic message (by design at the time). Staff had to use `/staff-login`.
- Resolution: unified login with role-based redirect (item 3 above) removes the
  wrong-portal failure mode by design.

## Operational lessons

1. **Chain `tsc` and `git commit` with `&&`** (or `set -e`). During this cycle a
   failed typecheck was committed anyway because the commands ran separately.
2. **Supabase + Prisma `migrate dev` does not work** while `directUrl` uses the
   connection pooler (shadow DB cannot be rebuilt). Workflow that works:
   hand-write the migration SQL, then `npx prisma migrate deploy`.
3. **Seed scripts must live inside `backend/`** so they resolve `@prisma/client`.
4. **Never build JSON payloads by shell interpolation of passwords**: special
   characters break the JSON (a `400 Bad escaped character` cost debugging time).
   Use Python `json.dumps` or pass via stdin.
5. **Verify the deployed bundle**, not just the local code, when behavior
   differs (chunks are under `_next/static`; NEXT_PUBLIC_* vars are inlined).

## Remaining backlog (renumbered)

1. Sync active tab to URL (`?tab=` param) in admin module pages.
2. WebSocket / real-time notifications for message inbox.
3. Storage: orphaned upload records; document the `uploads/` lifecycle.
4. Sweep remaining Spanish strings in the frontend (partially done this cycle:
   `storage.ts`, `_app.tsx`, `auth-context.tsx`, login subtitle).
5. Business Tax module skeleton.
6. Roadmap: 2FA and temporary passwords for staff accounts.
7. Orphan services/domains audit in Render (e.g. the
   `quantum-flux-solutions-mvp-api.onrender.com` domain) and Vercel.
8. Minor hardening: reject legacy invalid dispute statuses explicitly in
   `updateDisputeStatus` (BadRequest instead of Conflict).
9. Decouple admin/client storage scopes: replace dual-prefix session writes
   with a single shared prefix once the client subdomain is retired.

## Test data in production

- Client `test-e2e@quantumfluxsolutions.com` + one dispute exist from the E2E
  run (currently RESOLVED). Decide: keep as seed data or purge via transaction
  (pattern used in cycle 011).
