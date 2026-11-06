# Handoff 006: Real-time Entitlements & Stripe Production Readiness

**Date:** November 06, 2026
**Status:** In progress (follow-up to Handoff 005)
**Corrects:** Handoff 005 claimed "mock webhook" — audit shows `constructEvent` + `checkout.session.completed` handler already exist in `stripe.service.ts`. Verify signature + idempotency, not implement from scratch.

## Ordered work
1. Audit + harden existing Stripe webhook (signature verification, idempotency, error handling).
2. Add real-time auth/entitlements context so paid users do not need to log out and back in.
3. Migrate remaining `alert()` calls to `react-hot-toast` (DashboardModule, BusinessForm).
4. Guard Staff Tax PDF download until the Business Profile is saved.

## Acceptance criteria
- Webhook rejects requests without a valid `STRIPE_WEBHOOK_SECRET` signature.
- `checkout.session.completed` is idempotent: replaying the same `event.id` does not duplicate entries in `Customer.services`.
- Paying customers see unlocked modules after returning from Checkout without re-login (via `/api/auth/me` refresh + AuthContext).
- No `alert()` remains in `frontend/src/modules/dashboard/DashboardModule.tsx` or `frontend/src/modules/tax-business/components/BusinessForm.tsx`.
- Staff Tax PDF button is disabled with a `react-hot-toast` error until "Save Business Profile" succeeds.
- `.env.example` contains placeholders only. No real `sk_live_...` in repo or history.
- `git add` uses explicit paths (no `git add .`).

## Local Stripe test
`scripts/stripe-listen.sh` requires `STRIPE_SECRET_KEY`; it prints the `whsec_...` to set as `STRIPE_WEBHOOK_SECRET` before hitting the API.

## Known risks
- Entitlements depend on `localStorage` + JWT claim → stale after purchase until re-login.
- `alert()` still present in `DashboardModule.tsx` (credit dispute PDF) and `BusinessForm.tsx` (tax PDF).
- `git add .` in commit e0dcedc pulled in `package-lock.json`, `tsconfig.build.tsbuildinfo`, and an unrelated `stripe.service.ts` edit — scope discipline.
