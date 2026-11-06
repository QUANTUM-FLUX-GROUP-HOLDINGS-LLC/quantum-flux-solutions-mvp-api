# Handoff 003: Modular Architecture, RBAC & Business Logic

**Date:** November 05, 2026
**Status:** Fully Modular CRM MVP + RBAC Implemented

## 🏗️ Architectural Decisions (CRITICAL for future development)
1. **Feature-Driven Frontend Structure:** 
   - No global JS or CSS polluting across modules. 
   - `src/modules/` contains isolated folders (`credit`, `tax-personal`, `tax-business`, `bookkeeping`).
   - `src/modules/shared/` contains only the `AdminLayout` wrapper.
   - Each module has its own CSS files (if needed) and components. 
   - Next.js automatic Code Splitting ensures only the needed JS is loaded per route.
2. **Modular Backend (NestJS):**
   - Strictly separated modules: `CreditModule`, `TaxModule`, `TaxBusinessModule`, `AdminModule`.
   - Role-based endpoints using `RolesGuard` and `@Roles()`.

## ✅ What has been built in this session
1. **Role-Based Access Control (RBAC):** Roles (ADMIN, CREDIT_REPAIR, TAX_PERSONAL, TAX_BUSINESS, BOOKKEEPING, CLIENT) strictly isolated. Users are redirected to their specific module based on DB.
2. **Frontend Routes:** Separated into `/admin/credit`, `/admin/tax-personal`, `/admin/tax-business`, `/admin/bookkeeping`. Hidden staff login at `/staff-login`.
3. **Business Tax Module:** Full database integration (`BusinessTaxProfile`) and frontend form. Includes strict EIN validation (`XX-XXXXXXX`).
4. **Personal Tax Module:** Read-only view of client's personal tax data.

## 🧪 Test Users (Password: password123)
*   **Credit:** `credit@test.com`
*   **Personal Tax:** `tax@test.com`
*   **Business Tax:** `business@test.com`
*   **Bookkeeping:** `bookkeeper@test.com`

## 🚀 Next Steps (To-Do)
1. **Option B (Inbox/Messaging):** Create an internal chat between Staff and Clients within the modules. (Requires a new `Message` model).
2. **Option C (Tax PDF Generator):** Generate a downloadable PDF summary of the Tax Profile.
3. **Option D (Stripe Live Mode):** Switch to Live keys for real payments.

## 🔧 Post-Deployment Fix
- Corrected relative import paths for `AdminLayout` in `src/pages/admin/*.tsx` from `../../../` to `../../` to match the new modular directory structure.

## 🟢 Frontend Deployment Successful (Vercel)
- Resolved Node.js engine compatibility by updating `frontend/package.json` to `"node": "24.x"` (Vercel deprecated 20.x).
- Fixed relative import paths (`../../modules/shared/AdminLayout`) for the modular architecture.
- Vercel deployment is now **Ready** and serving the frontend successfully.

## 🧪 Smoke Tests Passed (Vercel Production)
- ✅ **Public Login (`/login`):** Correctly blocks Staff emails and displays a redirect message to the dedicated portal.
- ✅ **Staff Login (`/staff-login`):** Dedicated portal works and loads the role selector.
- ✅ **RBAC Enforcement (`/admin/tax-business`):** Logged in as `TAX_BUSINESS`. Sidebar correctly isolates the module. Client list fetches successfully from the backend.

## 🚀 Features Implemented (Options B, C, D)
1. **Option B (Inbox/Messaging):** Added `Message` model in Prisma. Created `MessagesModule` in NestJS. Added a floating `ChatWidget` in the frontend (currently mocked, ready to be connected to the API).
2. **Option C (Tax PDF Generator):** Installed `pdfkit` in the backend. Added a `GET /tax-business/:id/pdf` endpoint to generate and download a PDF summary of the Business Tax Profile. Added the "Download PDF" button in the frontend.
3. **Option D (Stripe Integration):** Installed Stripe SDK. Created `StripeModule` and `POST /stripe/checkout` endpoint to generate a Checkout Session for the $149/mo subscription. Added a "Pay $149/mo" button in the Client Dashboard.

## ⚠️ Pending Configurations
- **Stripe:** Need to add `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID` in Render environment variables.
- **Messaging:** The ChatWidget is currently mocked; it needs to be connected to the `/messages` endpoint using the logged-in user's ID.
