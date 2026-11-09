# Orphan services & domains audit (2026-11-09)

Scope: Render and Vercel assets owned by Quantum Flux Holdings LLC.
Rule applied: no deploys in 30+ days AND no live domain referencing it
=> suspend, observe one week, then delete.

## Render backend services

| Host                              | Status    | Evidence / Action                          |
| --------------------------------- | --------- | ------------------------------------------ |
| quantum-flux-api-npru.onrender.com | ACTIVE    | Production backend (E2E verified cycle 011-012). Keep. |
| quantum-flux-solutions-mvp-api.onrender.com | ORPHAN | `x-render-routing: no-server` (cycle 012); stray probes returned 404 and misled login debugging. DELETE after confirming owner service. |

## Vercel projects

| Project | Domain | Last deploy | Verdict |
| ------- | ------ | ----------- | ------- |
| TODO: list from dashboard | | | |

## DNS records (registrar)

| Record | Target | Verdict |
| ------ | ------ | ------- |
| TODO: list from registrar | | |

## Decisions log

- 2026-11-09: audit opened; mvp-api orphan host confirmed from cycle 012 notes.

## Dispute status sanity check (item 8 verification)

- `updateDisputeStatus` already rejects unknown/legacy statuses with an
  explicit `BadRequestException` (400) and forbidden transitions with a
  descriptive `ConflictException` (409). Item 8 was satisfied during cycle
  012's Mark-as-Sent work; no further change required.
- Decision: no redundant DTO validation at controller level (service-level
  validation is explicit and message-rich; duplication adds maintenance
  cost without security benefit).
- `backend/check-dispute-statuses.mjs` added as a permanent read-only
  diagnostic (groups dispute rows by status). Run result 2026-11-09: [].
