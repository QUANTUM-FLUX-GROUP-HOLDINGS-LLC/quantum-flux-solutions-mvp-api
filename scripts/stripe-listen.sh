#!/usr/bin/env bash
set -euo pipefail

# Load backend .env if present
if [ -f "backend/.env" ]; then
  export $(grep -v '^#' backend/.env | grep 'STRIPE_SECRET_KEY' | xargs)
fi

if [ -z "${STRIPE_SECRET_KEY:-}" ] || [ "$STRIPE_SECRET_KEY" = 'sk_test_...' ]; then
  echo "❌ ERROR: STRIPE_SECRET_KEY is not set in backend/.env"
  echo "Go to Stripe Dashboard -> Developers -> API Keys and copy the Secret Key."
  exit 1
fi

stripe listen \
  --api-key "$STRIPE_SECRET_KEY" \
  --events checkout.session.completed \
  --forward-to localhost:3000/api/stripe/webhook
