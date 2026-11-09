# Handoff 010: Functional Phase + Production Deployment

**Date:** November 09, 2026
**Status:** All Handoff 009 follow-up items complete. Deployed to production
(Render: API, Vercel: frontend). Smoke-tested end-to-end.

## Production URLs
- Frontend: https://quantum-flux-solutions-mvp-api.vercel.app
- API: https://quantum-flux-api-npru.onrender.com/api
- Frontend env: NEXT_PUBLIC_API_URL (set in Vercel, Production)
- Backend env: FRONTEND_URL must point to the Vercel domain (reset emails + CORS)

## Completed this cycle
1. **Chat security fix:** JwtAuthGuard on all /messages routes; sender derived
   from token; conversations readable only by participants (IDOR closed).
2. **Real password reset:** POST /auth/forgot-password (anti-enumeration) +
   POST /auth/reset-password (short-lived JWT with purpose claim);
   JwtStrategy rejects purpose-bearing tokens as session tokens;
   MailService.sendPasswordResetEmail via Resend; /forgot-password connected,
   /reset-password page built. Resend domain pending verification.
3. **Admin client management:** POST/PATCH/DELETE /admin/clients (self-delete
   forbidden, messages cleaned in transaction); role gate on ALL /admin routes
   (CLIENT tokens rejected); ClientFormModal (create/edit) + ClientDirectory
   with inline delete confirm, wired into /admin/credit as a Clients tab.
4. **Contextual module sidebar:** entering a module swaps the sidebar for its
   own section menu (master module picker remains via "All Modules");
   ?tab=deep links on /admin/credit (disputes/letters/clients).
5. **Deployment:** Render auto-deploy from main verified (guards live:
   /api/auth/me and /api/admin/clients return 401 anonymous); Vercel
   production build verified; secrets audit clean (.env never committed).

## Test accounts (LOCAL/SHARED DB - REMOVE BEFORE REAL CLIENTS)
All passwords: password123. CLIENTs: client1@test.com (John Doe),
client2@test.com (Jane Smith), prueba@test.com (Ramon), mama@gmail.com (Pedro).
ADMIN: credit@test.com (promoted via Prisma Studio). Also business@test.com,
tax@test.com, bookkeeper@test.com, sarah@test.com.

## Known issues / backlog for 011
1. Resend sender domain (quantumfluxsolutions.com) not verified yet -> emails
   fail silently (catch only logs). Rotate RESEND_API_KEY before production.
2. Test accounts share the production DB; purge before onboarding clients.
3. Dispute statuses in DB include APPROVED but frontend maps PENDING/RESOLVED
   (credit.tsx handleResolve sends RESOLVED) -> align the state machine.
4. Sidebar highlight may lag when switching tabs via the in-page tab bar
   (?tab= not synced with router.replace).
5. Letter Library templates persist in local state only -> need POST /letters.
6. Chat uses 5s polling -> upgrade to WebSocket eventually.
7. Physical files in Supabase Storage are orphaned when a client is deleted
   (DB rows cascade; storage objects stay) -> cleanup job.
8. uploads/ served from local disk in main.ts -> ephemeral on Render; remove.
9. Spanish comments remain in admin pages (repo language rule: English only).
10. Business Tax module still needs admin-side section growth (only Profiles).
