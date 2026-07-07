# 2026-03-26 Next-Session Handoff

Actionable requests for future sessions. Each item includes the superpowers skill to invoke
and enough context to start immediately.

## How to Use This Document

Pick an item, open a new Claude Code session, and paste the request. The skill annotation
tells Claude which workflow to follow. Items are ordered by priority within each tier.

---

## Tier 1 — Launch-Critical

### 1. Stripe Product Setup and Checkout Validation

> **Skill:** `superpowers:brainstorming` (then `executing-plans`)
>
> Brainstorm the end-to-end Stripe go-live sequence: create Basic ($9/mo) and Premium
> ($19/mo) products in the Stripe Dashboard, copy price IDs into Vercel env vars
> (`STRIPE_BASIC_PRICE_ID`, `STRIPE_PREMIUM_PRICE_ID`), register the production webhook
> endpoint, and run a staged checkout-to-tier-sync drill. Validate that
> `/api/stripe/webhook` correctly updates the member tier in Supabase after a successful
> subscription event.
>
> **Blocked on:** Stripe Dashboard access, Vercel env var write access.
>
> **References:** `docs/DEFERRALS.md`, `docs/ops/env-vars.md`, `src/app/api/stripe/webhook/route.ts`

### 2. DNS and Custom Domain Cutover

> **Skill:** `superpowers:executing-plans` (use `docs/ops/launch-dashboard-checklist.md` as the plan)
>
> Point the production domain at Vercel, update `NEXT_PUBLIC_SITE_URL`, configure Supabase
> auth callback URLs for the new domain, and verify Resend sender domain alignment. Run the
> `/domain-setup` skill if available.
>
> **Blocked on:** Domain registrar access.
>
> **References:** `docs/DEFERRALS.md`, `docs/ops/launch-dashboard-checklist.md`

### 3. Launch Operator Drill

> **Skill:** `superpowers:executing-plans` (use `docs/ops/launch-checklist.md` as the plan)
>
> Walk through every gate in the launch checklist end-to-end: admin login, content
> create/edit/publish round-trip, staged Stripe checkout, webhook tier sync, gated handbook
> download via signed URL, contact form submission, newsletter subscribe. Document any
> failures and fix them in-session.
>
> **References:** `docs/ops/launch-checklist.md`, `docs/ops/release-sequence.md`

---

## Tier 2 — High-Impact Dev Work

### 4. Admin-Queries Test Coverage Uplift

> **Skill:** `superpowers:brainstorming` → `superpowers:writing-plans` → `superpowers:executing-plans`
>
> The admin data layer (`src/lib/supabase/admin-queries/`) is at ~20% statement coverage.
> The audit target is 60%+. Brainstorm a test strategy covering all 12 domain modules
> (articles, briefings, dispatches, handbooks, downloads, courses, members,
> contact-submissions, subscribers, activity-log, counts, insights). Use deterministic
> Supabase mocks following the pattern in `tests/helpers/supabase-mock.ts`. Prioritize
> modules that handle status transitions and publish workflows.
>
> **References:** `docs/audits/2026-03-25-codebase-audit-remediation-plan.md` (P0 item),
> `tests/lib/admin-queries/` (existing tests)

### 5. E2E Critical Journey Expansion

> **Skill:** `superpowers:brainstorming` → `superpowers:writing-plans` → `superpowers:executing-plans`
>
> Only 10 smoke-level Playwright tests exist. Design and implement E2E specs for:
> (a) admin login gate and redirect, (b) admin create-edit-publish for one content type,
> (c) Stripe checkout initiation and return, (d) gated content access verification,
> (e) contact form happy-path and validation failure. Use existing Playwright config in
> `playwright.config.ts`.
>
> **References:** `docs/audits/2026-03-25-codebase-audit-remediation-plan.md` (P2 item),
> `e2e/` directory

### 6. Admin Dashboard Component Extraction

> **Skill:** `superpowers:brainstorming` → `superpowers:writing-plans` → `superpowers:executing-plans`
>
> `src/app/(auth)/admin/page.tsx` is 580 LOC. Extract focused sub-components: metrics panel,
> editorial pipeline status, attention queue, publishing queue, activity log, audience/billing
> summary, quick actions. Keep all data fetching in the parent server component; children are
> presentational. Ensure existing admin tests still pass after extraction.
>
> **References:** `src/app/(auth)/admin/page.tsx`, `tests/admin/`

---

## Tier 3 — Feature Ideas

### 7. Email Campaign Tooling

> **Skill:** `superpowers:brainstorming`
>
> Resend is wired for transactional email but there is no broadcast/campaign capability.
> Design a lightweight campaign sender: compose in admin, target by tier or subscriber
> segment, send via Resend broadcast API, track delivery status. Consider whether this
> should be a new admin desk or an extension of `/admin/subscribers`.
>
> **References:** `src/lib/email.ts`, `src/app/(auth)/admin/subscribers/`,
> `docs/superpowers/plans/2026-03-25-admin-command-center-roadmap.md` (Batch 6)

### 8. Content Analytics Dashboard

> **Skill:** `superpowers:brainstorming`
>
> Once Plausible is configured, surface page views, top articles, lens engagement, and
> referral sources inside the admin panel. Design as a new admin section or as cards on
> the existing dashboard. Consider the Plausible Stats API for server-side data fetching.
>
> **Blocked on:** Plausible account and `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` env var.
>
> **References:** `docs/DEFERRALS.md`, `docs/superpowers/plans/2026-03-25-admin-command-center-roadmap.md` (Batch 6)

### 9. Search Enhancement

> **Skill:** `superpowers:brainstorming`
>
> Current search (`POST /api/search`) is a basic text query. Design advanced search with:
> lens filter, date range, access tier filter, content type selector, and sort options
> (relevance, date, popularity). Consider whether this is a UI-only change on the existing
> `/search` page or requires API changes.
>
> **References:** `src/app/api/search/route.ts`, `src/app/(public)/search/page.tsx`

### 10. Member Engagement Features

> **Skill:** `superpowers:brainstorming`
>
> The member portal (`/portal`) exists but is minimal. Brainstorm engagement features:
> bookmarked/saved articles, reading history, personalized lens recommendations, member
> profile customization. Consider what requires schema changes vs. what can use
> client-side storage.
>
> **References:** `src/app/(auth)/portal/`, `src/components/portal/`

---

## Tier 4 — Housekeeping

### 11. Route Literal Migration to PATHS Constants

> **Skill:** `superpowers:executing-plans`
>
> ~571 hardcoded `/admin` string literals exist across `src/` and `tests/`. Gradually
> migrate to `PATHS.ADMIN_*` constants from `src/lib/paths.ts`. This is a mechanical
> refactor — no brainstorming needed. Work one directory at a time, run tests after each
> batch.
>
> **References:** `src/lib/paths.ts`

### 12. Audit Document Archival

> **Skill:** none (manual file moves)
>
> The `docs/audits/` directory has completed audit documents from March 22 and March 25.
> Move resolved audits to `docs/audits/archive/` to reduce cognitive load for new
> contributors. Update `docs/INDEX.md` references.
>
> **References:** `docs/audits/`, `docs/INDEX.md`
