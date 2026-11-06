#!/usr/bin/env bash
set -euo pipefail

: "${STRIPE_SECRET_KEY:?STRIPE_SECRET_KEY is required}"

# Prints the webhook signing secret to put in STRIPE_WEBHOOK_SECRET
stripe listen \
  --api-key "$STRIPE_SECRET_KEY" \
  --forward-to localhost:3000/api/stripe/webhook
