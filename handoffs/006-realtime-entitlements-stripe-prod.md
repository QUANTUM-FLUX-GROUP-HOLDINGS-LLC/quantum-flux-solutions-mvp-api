# Handoff 006: Real-time Entitlements & Stripe Production Readiness

**Date:** November 06, 2026
**Status:** Planned (follow-up to Handoff 005)

## Ordered work
1. Replace mock Stripe webhook with verified `checkout.session.completed` handler.
2. Add real-time auth/entitlements context so paid users do not need to log out and back in.
3. Guard Staff Tax PDF download until the Business Profile is saved.
4. Document Stripe live-mode cutover without committing live secrets.

## Acceptance criteria
- Webhook verifies signatures with `STRIPE_WEBHOOK_SECRET` via `stripe.webhooks.constructEvent`.
- On `checkout.session.completed`, `Customer.services` is updated with the purchased service (idempotent — safe on Stripe retries).
- Paying customers see unlocked modules after returning from Checkout without re-login (via `/api/auth/me` refresh).
- Staff Tax PDF button is disabled with a clear toast until "Save Business Profile" succeeds.
- `.env.example` contains placeholders only. No `sk_live_...` in repo or history.
- `git add` uses explicit paths (no `git add .`).

## Local Stripe test
Use `scripts/stripe-listen.sh` (see below).

## Known risks
- Current entitlement flow depends on `localStorage` + JWT claim → stale after purchase.
- Mock webhook does not verify signature → unsafe in production.
- `package-lock.json` and unrelated files were caught by `git add .` in commit e0dcedc — review scope discipline.
