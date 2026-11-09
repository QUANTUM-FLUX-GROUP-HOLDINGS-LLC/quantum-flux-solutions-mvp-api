# Handoff 011: Security Hardening + Auth Policy + Dispute State Machine

**Date:** November 09, 2026
**Status:** Follow-ups 1-3 from Handoff 010 complete. Governance structure added.

## Completed this cycle
1. **Email pipeline hardened:** MailService now logs failures with context
   (masked recipient + subject) and rethrows on the critical path only
   (password reset); non-critical emails stay best-effort. AuthService
   catches provider failures so /auth/forgot-password never becomes an
   enumeration oracle. Warn at boot if RESEND_API_KEY missing.
2. **Resend production-ready:** domain quantumfluxsolutions.com Verified
   (DKIM + SPF CNAMES, Nov 05); reset emails confirmed Delivered to Proton.
   Resend tab shows support@ welcome + reset delivered end-to-end.
3. **Real admin account:** support@quantumfluxsolutions.com registered,
   promoted to ADMIN, status ACTIVE, strong passphrase set via direct
   bcrypt update (never in shell history). Runbook for staff recovery:
   docs/runbooks/staff-password-recovery.md.
4. **Test account purge:** 11 test accounts deleted in one transaction
   (explicit message cleanup first - Message has no onDelete cascade;
   documents/disputes/profiles cascade). Safety gate compared the exact
   account set before deleting. DB now: 1 customer (support@), 0 messages.
5. **Auth policy - differentiated recovery:** single login endpoint for
   everyone; self-service email reset is CLIENT-only. Staff roles
   (ADMIN, TAX_PERSONAL, TAX_BUSINESS, BOOKKEEPING, CREDIT_REPAIR) get a
   logged warning and no email; recovery is a manual Super Admin flow.
   Generic response preserved (anti-enumeration intact).
6. **Dispute state machine enforced:** PENDING -> SENT -> RESOLVED only;
   invalid statuses rejected (BadRequest), illegal transitions rejected
   (Conflict), never back to PENDING. Dispute table was empty at purge
   time so no data migration was needed. Dispute status emails now say
   the right thing per state (was: everything non-SENT = "deleted").
7. **Repo hygiene:** all Spanish comments translated in backend (credit,
   main, auth, mail); governance/CONVENTIONS.md committed; handoffs
   consolidated into docs/handoffs/.

## Commits this cycle
- 8cd0fa8 fix(auth): isolate reset email failure (enumeration oracle)
- 81348a1 fix(mail): contextual error logging, rethrow critical reset email
- 2c1c2e5 feat(auth): CLIENT-only self-service reset + staff runbook
- 2fc310c docs: fix runbook typo
- d3d7043 feat(credit): dispute state machine + status email text + comments
- 1f39cc0 + follow-up: Spanish comment sweep in backend

## Known issues / backlog for 012
1. Admin UI has only a Resolve button; no flow to mark a dispute SENT
   (the state machine allows it). Do together with letters persistence.
2. Letter Library templates persist in local state only -> POST /letters.
3. ?tab= not synced with router.replace (sidebar highlight lags).
4. Chat uses 5s polling -> WebSocket.
5. Supabase Storage objects orphaned on client delete -> cleanup job.
6. uploads/ served from local disk in main.ts -> ephemeral on Render; remove
   or move to Supabase Storage (also causes orphan orphans overlap with #5).
7. Spanish comment sweep still pending for frontend admin pages.
8. Business Tax module admin-side growth (only Profiles).
9. Roadmap: admin panel UI to issue temp staff passwords (audit-logged);
   mandatory 2FA for staff (consider Proton Authenticator);
   rotate RESEND_API_KEY regularly.
10. Verify in Render logs that "Blocked self-service reset for staff..."
    appears on staff forgot-password attempts (policy deployed, spot-check).
