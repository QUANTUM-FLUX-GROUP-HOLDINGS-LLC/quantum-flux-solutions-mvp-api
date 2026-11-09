# Handoff 001: Initial MVP Setup & Production Deployment

**Date:** November 04, 2026
**Project:** Quantum Flux Solutions MVP (Credit Repair, Taxes, Bookkeeping)
**Status:** MVP Core Complete (Auth + Payments + Deployment)

## 🏗️ Tech Stack
*   **Frontend:** Next.js, React, Tailwind CSS (Deployed on Vercel)
*   **Backend:** NestJS, TypeScript (Deployed on Render)
*   **Database:** PostgreSQL via Supabase, Prisma ORM
*   **Payments:** Stripe Checkout & Webhooks (Test Mode)
*   **Auth:** JWT & Bcrypt

## ✅ What has been built and completed
1.  **Database:** Schema created for `Customer` (id, email, name, password, stripeId, status, createdAt).
2.  **Auth Flow:** Register, Login, JWT generation, and Protected Routes (`/dashboard`).
3.  **Stripe Integration:**
    *   Creating a customer in Stripe (if it doesn't exist).
    *   Creating a Checkout Session ($149/mo).
    *   Webhook listener (`checkout.session.completed`) to update DB status to `ACTIVE`.
    *   Dynamic Redirect URLs (returns to localhost in dev, and Vercel in prod).
4.  **Frontend UI:**
    *   Login/Register page.
    *   Protected Dashboard with Sidebar, Status Badge (PENDING/ACTIVE), File Upload UI (mock).
5.  **Deployment:** CI/CD pipeline set up. Push to `main` deploys automatically to Vercel and Render.

## ⚠️ Important Notes & Caveats
*   **Render Sleep:** The backend is on the free tier and sleeps after 15 mins. Hitting `https://quantum-flux-api-npru.onrender.com/api/health` wakes it up (takes ~50 seconds).
*   **Stripe Link:** In test mode, Stripe Link asks for an OTP. Use `000000` to bypass it.
*   **Environment Vars:** Do NOT commit `.env`. Env vars are set in Render and Vercel dashboards.
*   **File Upload:** Currently just a UI mock. It does not actually save files to a server yet.

## 🚀 Next Steps (To-Do)
1.  **Supabase Storage:** Implement real file uploads for credit reports (PDFs).
2.  **Admin Panel:** Create an admin route (`/admin`) to view ACTIVE customers and download files.
3.  **Email Notifications:** Integrate Resend or SendGrid to send welcome/receipt emails.
4.  **Real Business Logic:** Build the actual credit dispute tracker and tax preparation forms.
