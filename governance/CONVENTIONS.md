# Project Conventions

## Language
- Chat: Spanish. Repo (code, comments, commits): English only.

## Workflow
- Files created/updated via heredocs (cat with quoted delimiter) or python3 anchor patches.
- Verify with `npx tsc --noEmit` (both backend and frontend) before any commit.
- New handoffs are born in `docs/handoffs/` (single canonical directory).

## Security baseline
- All admin endpoints gate non-CLIENT roles (`assertStaff`).
- Chat `senderId` derived from JWT, never from request body.
- Secrets never committed (.env excluded); exposed keys must be rotated immediately.
- Anti-enumeration: auth errors identical whether resource exists or not.

## Deploy
- Render: API auto-deploy from main. Vercel: frontend auto-deploy from main.
- Local and production share the same Supabase DB — test accounts must be purged before real clients.
