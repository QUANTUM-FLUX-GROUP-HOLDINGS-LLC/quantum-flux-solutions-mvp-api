# Handoff 013 — MVP hardening cycle (2026-11-09/10)

Repo: quantum-flux-solutions-mvp-api (backend Render, frontend Vercel).
Status: backlog 013 fully serviced. External verifications pending (below).

## Completed work

1. Admin tab sync (?tab=) — commit 517e995 (useTabParam hook, credit.tsx).
2. Inbox realtime SSE — commit 2e431b7 (sse-auth.guard, MessagesService
   subscribers, EventSource + polling fallback; ?token= debt documented).
3. Storage/documents lifecycle — commit 5fd3d79 (DELETE /documents/:id
   owner/ADMIN, SupabaseService.deleteFile, audit-uploads.mjs).
4. Spanish-string sweep — commit 061f522 (6 files).
5. Business Tax skeleton — commit fdf3956 (secured tax-business
   controller, UpdateBusinessProfileDto with EIN regex, admin page).
6. Security roadmap — commits a6a9fbc, 62f48ff, 274d1f6 (README).
7. Orphan audit opened — commit 6fcb15f (docs/orphan-audit.md).
8. Dispute status hardening — commit ae5cba9: found ALREADY implemented
   (400 unknown status / 409 illegal transition); recorded, added
   backend/check-dispute-statuses.mjs (prod run: []).
9. Storage prefix decoupling — commit c4ade40: single qfs_ prefix,
   in-flight legacy migration (client_/staff_), no forced logout.

## Bonus work (outside backlog)

- Route guard ghost page fix — commit b1b98bc: _app.tsx still redirected
  to /staff-login (removed in 012) causing a 404 for anonymous /admin/*.
- Staff recovery escalation — commits 5e5ccd4, c6ab07c, 5477351:
  forgot-password on staff sends best-effort notice to ADMIN_NOTIFY_EMAIL
  (roadmap item 1 flow); neutral staff block on the confirmation screen
  preserves anti-enumeration; response identical for all users.

## Incident: broken build on main (fixed same night)

- Cause: escalation patch anchor '\n  }\n}\n' spanned TWO braces; the
  replacement dropped sendPasswordResetEmail's closing brace. Commit
  5e5ccd4 reached GitHub despite tsc failing (fragmented paste chain
  executed commit separately). Repair: c6ab07c; lessons 11-13 in README.

## Lessons added (README "Patch-script lessons")

- L11: anchors must never span more than one functional brace.
- L12: verification and commit run as separate blocks; confirm each
  output before proceeding while paste fragmentation is occurring.
- L13: build anchors verbatim from cat/sed output, counting exact spaces.

## External verifications pending (owner: user)

- Render: add ADMIN_NOTIFY_EMAIL (suggested support@quantumfluxsolutions.com).
- Render: confirm SUPABASE_URL real vs mock (document-loss risk per deploy).
- Orphan audit (item 7): paste Render services, Vercel projects and DNS
  records into docs/orphan-audit.md TODOs; verdicts = suspend, observe,
  delete (never direct delete).
- E2E post-deploy: /admin/* anonymous -> /login (no 404); staff
  forgot-password triggers admin notice; unknown email = identical
  response; SSE inbox < 1s; tab URLs; login continuity for a browser
  holding a pre-c4ade40 session (validates in-flight migration).

## Proposed backlog 014

1. DONE (2026-11-10, commit f7a1306): 2FA TOTP staff phase 1 delivered and E2E verified; phase 2 (QR, recovery codes, UI, rollout) remains.
2. Close orphan audit once dashboard lists arrive.
3. DONE (2026-11-10, commit e422bb3): single-use stream tickets; ?token= retired (see README roadmap item 3).
4. Consider session hardening: short-lived JWT + refresh path.
