---
title: Architecture
status: canonical
audience: [engineers, agents]
last-verified: 2026-04-08
---

# Architecture

> System design reference for The Black Male Journal. Read this to understand how the pieces fit together.

## Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16 (App Router) | Server/client rendering, routing, API routes |
| Language | TypeScript (strict) | Type safety |
| Styling | Tailwind CSS | Utility-first CSS with BMJ brand tokens |
| Database | Supabase (PostgreSQL) | Content storage, auth, file storage |
| Payments | Stripe | Subscriptions (basic/premium) and donations |
| Email | Resend | Transactional email (contact form) |
| Hosting | Vercel | Auto-deploy from `main`, preview deploys per PR |
| Analytics | Plausible | Privacy-first analytics (optional) |

## Directory Structure

```
src/
  app/
    (public)/          Public routes (articles, briefings, academy, blog, etc.)
    (auth)/            Protected routes (login, signup, portal, admin)
      admin/           Admin CMS panel (CRUD for all content types)
      portal/          Member portal (settings, subscription management)
    api/               API routes (Stripe, contact, newsletter, search)
    layout.tsx         Root layout — fonts, providers, analytics
    sitemap.ts         Dynamic sitemap generation
  components/
    admin/             Admin UI (MetricCard, DeleteButton, BulkActionForm, etc.)
    brand/             Brand mark, lens badge, logo
    content/           Content cards (ArticleCard, CourseCard, HandbookCard, etc.)
    home/              Homepage sections (FeaturedCarousel, PosterBlock, etc.)
    layout/            Navbar, Footer, MobileMenu, PageHeader
    motion/            ScrollReveal, PageTransition
    portal/            Member portal (CheckoutButton, SubscriptionManager)
    seo/               JsonLd structured data
    ui/                Primitives (StarDivider, ShareButton, Breadcrumbs, etc.)
  lib/
    supabase/
      server.ts        Server-side Supabase client
      client.ts        Client-side Supabase client
      queries.ts       All public-facing database queries
      access.ts        Tier-based content access control
      types.ts         TypeScript types for all database tables
      admin-queries/   Admin CRUD queries — one TS module per domain, barrel via `admin-queries.ts` (service-role client stays in `admin.ts` )
    stripe/
      config.ts        Stripe client, price IDs, tier mapping
      helpers.ts       Checkout session and billing portal creation
    content/           Content formatting utilities
    membership.ts      Tier comparison helpers (includesTier, compareTiers)
    placeholders.ts    Content-type placeholder image paths
    admin-auth.ts      Admin session helpers
    admin-publishing.ts  Publish readiness validation
    admin-insights.ts  Dashboard metric computation
    lens-theme.ts      Lens-to-Tailwind-class mapping
    paths.ts           Centralized route path constants
    seo.ts             SEO helpers, structured data builders
    email.ts           Resend email sending
    rate-limit.ts      API rate limiter
    storage-assets.ts  Supabase Storage URL helpers
  styles/
    brand.css          CSS custom properties (--bmj-* variables)
    globals.css        Global styles, grain/halftone filters
  proxy.ts             Auth middleware (route protection, RBAC)
public/
  logos/               Brand identity (PNG, SVG)
  placeholders/        Content-type fallback images (SVG)
  textures/            Grain overlay
  fonts/               Self-hosted Highrise typeface
```

## Repository layout — monorepo root

This section is the **curated map** of what lives at the repo root and how **`docs/`** is organized by lane. It complements the application tree above and [`AGENTS.md`](../AGENTS.md) (top-level governance domains). **Do not** treat this as an exhaustive file listing; for a shallow on-disk snapshot run `npm run docs:layout`.

### Root entries

| Path | Role |
|------|------|
| [`AGENTS.md`](../AGENTS.md) | Normative repo governance (domains, invariants, protocol). |
| [`CLAUDE.md`](../CLAUDE.md) | Assistant and contributor project instructions. |
| `.github/` | CI workflows, Issue templates, PR template, governance verify inputs. |
| `docs/` | Committed documentation — see **Documentation lanes** below and [`README.md`](README.md). |
| `public/` | Static assets (logos, placeholders, fonts, textures). |
| `scripts/` | Automation — [`scripts/README.md`](../scripts/README.md) (verify, seeds, layout printer). |
| `src/` | Next.js application (see **Directory Structure** above). |
| `supabase/` | Local config, migrations, seed SQL. |
| `tests/` | Jest + Playwright — layout: [`tests/README.md`](../tests/README.md). |

### Documentation lanes (`docs/`)

Each lane has a **README.md** entry point (naming rules: [`CONTRIBUTING.md`](CONTRIBUTING.md) — *File naming — documentation*). Cross-org REP reference modules live under **`standards/`**; BMJ product/deep docs live in root handbooks and lanes like **`ops/`**, **`brand/`**.

| Lane | Entry | Contents |
|------|--------|----------|
| Audits | [`audits/README.md`](audits/README.md) | Audit reports and archive. |
| Brand | [`brand/README.md`](brand/README.md) | Invariants, art direction, palette references. |
| Operations | [`ops/README.md`](ops/README.md) | Runbooks, env vars SSOT, launch/release SOPs. |
| Standards | [`standards/README.md`](standards/README.md) | Agent knowledge protocol. |
| Archive | [`archive/2026-04-08-cleanup/`](archive/2026-04-08-cleanup/README.md) | Historical artifacts (deployment, beautification, REP governance, session notes). |

**BMJ comprehensive SSOT:** [`BMJ-SSOT.md`](BMJ-SSOT.md) — single entry for what BMJ is, what we are building, where truth lives, and what is next. **Application-only depth:** section *Directory Structure* in this file.

## Request Flow

```
Browser Request
  |
  v
proxy.ts (middleware)
  |-- Unauthenticated + protected route? --> redirect to /login
  |-- Authenticated + admin route? --> check member.role (admin|editor)
  |-- Authenticated + auth page? --> redirect to /portal
  |
  v
Next.js App Router
  |-- Server Component? --> fetch data from Supabase, render HTML
  |-- Client Component? --> hydrate with interactivity
  |-- API Route? --> validate (Zod), rate limit, process, respond
```

## Database Schema

### Content Tables

| Table | Key Fields | Notes |
|-------|-----------|-------|
| `articles` | title, slug, lens, tags[], excerpt, body, featured, access_tier, status, author, cover_image, published_at | Main editorial content |
| `briefings` | title, slug, issue_number, sections (JSON), access_tier, status, cover_image, published_at | Weekend Briefing — flagship format |
| `dispatches` | title, slug, lens, excerpt, body, status, author, cover_image, published_at | Short-form posts (served at /blog) |
| `handbooks` | title, slug, lens, description, body, access_tier, status, author, cover_image, file_url, published_at | Deep-dive reference guides |
| `courses` | title, slug, description, category, access_tier, published, cover_image | Academy courses |
| `lessons` | title, slug, course_id (FK), order_number, body, video_url, duration, published | Lessons within courses |
| `downloads` | title, slug, description, category, file_url, file_type, file_size, access_tier, cover_image, published_at | Downloadable resources |

### Platform Tables

| Table | Key Fields | Notes |
|-------|-----------|-------|
| `members` | email, tier (free/basic/premium), role (member/editor/admin), stripe_customer_id, stripe_subscription_id | User accounts |
| `newsletter_subscribers` | email, source, subscribed_at, unsubscribed_at | Newsletter list |
| `contact_submissions` | name, email, subject, message, status (new/in_progress/resolved/spam), internal_notes | Contact form inbox |
| `admin_activity_log` | actor_email, actor_role, entity_type, entity_id, entity_title, action, summary | Admin audit trail |

### Relationships

```
Course (1) ---> (many) Lesson     via lesson.course_id
Member (1) ---> (1) Stripe Customer   via member.stripe_customer_id
```

All other content tables are independent (no foreign keys between articles, briefings, etc.).

### Content Status Lifecycle

```
draft --> review --> scheduled --> published --> archived --> withdrawn
```

- `draft` — work in progress, not public
- `review` — ready for editorial decision
- `scheduled` — approved, `published_at` set in future
- `published` — live on site
- `archived` — removed from listings, accessible via direct URL
- `withdrawn` — fully hidden

## Authentication and Access Control

### Auth Flow

1. **Supabase Auth** handles signup/login (email + password)
2. **proxy.ts** middleware protects routes and enforces role checks
3. **Admin layout** double-checks role before rendering admin pages
4. **Content access** is gated at the component level

### Tier-Based Access

```
free < basic < premium
```

Content has an `access_tier` field. Access check:

```tsx
import { checkContentAccess } from '@/lib/supabase/access';
const { hasAccess, user } = await checkContentAccess(content.access_tier);
```

Always use `includesTier()` and `compareTiers()` from `@/lib/membership.ts`. Never compare tier strings directly.

### Role-Based Access

| Role | Permissions |
|------|------------|
| `member` | View content per tier |
| `editor` | All of member + admin panel access |
| `admin` | All of editor + member management |

## Stripe Integration

### Subscription Flow

```
User clicks "Subscribe"
  --> POST /api/stripe/checkout (creates Stripe Checkout session)
  --> Stripe hosted checkout page
  --> Payment success
  --> Stripe sends webhook to POST /api/stripe/webhook
  --> handleCheckoutCompleted() updates member tier + stripe IDs in Supabase
```

### Webhook Events Handled

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Set member tier, store stripe_customer_id and stripe_subscription_id |
| `customer.subscription.updated` | Update tier if subscription active |
| `customer.subscription.deleted` | Downgrade member to free |
| `invoice.payment_failed` | Log warning |

### Billing Portal

Members manage subscriptions via Stripe's hosted portal:
```
POST /api/stripe/manage-billing --> createBillingPortalSession() --> redirect to Stripe portal
```

## API Routes

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/contact` | POST | None | Contact form submission |
| `/api/newsletter/subscribe` | POST | None | Newsletter signup |
| `/api/search` | GET | None | Full-text content search |
| `/api/downloads/[slug]` | GET | Tier | File download redirect |
| `/api/handbooks/[slug]/download` | GET | Tier | Handbook file download |
| `/api/stripe/checkout` | POST | Auth | Create subscription checkout |
| `/api/stripe/donate` | POST | None | One-time or recurring donation |
| `/api/stripe/manage-billing` | POST | Auth | Redirect to Stripe portal |
| `/api/stripe/webhook` | POST | Stripe sig | Webhook event handler |
| `/api/admin/upload` | POST | Admin | Storage file upload |
| `/api/admin/subscribers/export` | GET | Admin | CSV subscriber export |

All API routes follow the same pattern: validate input with Zod, apply rate limiting, process with Supabase, return JSON.

## Admin CMS

The admin panel is a no-code CMS at `/admin`. Every content domain follows the same file structure:

```
admin/<domain>/
  page.tsx              List view (table with status, edit/delete)
  actions.ts            Server actions (create, update, delete)
  delete-action.ts      Separate delete action (confirmation required)
  <Domain>Form.tsx      Shared form for create + edit
  new/page.tsx          Create page
  [id]/edit/page.tsx    Edit page
```

### Admin Dashboard

The dashboard at `/admin` is an owner command center showing:
- Inbox pressure, editorial backlog, scheduled items, paying members, subscribers
- Attention queue (critical/warning items)
- Publishing queue (upcoming scheduled content)
- Editorial pipeline (draft/review/scheduled/published counts)
- Audience and billing metrics
- Recent editorial activity
- Quick actions (new article, briefing, dispatch, course, handbook, download)

### Admin Queries

Admin queries live in `src/lib/supabase/admin-queries/` with one file per domain. The barrel export at `index.ts` re-exports all functions. The dashboard uses `getAdminCommandCenterSnapshot()` which aggregates counts, pipeline status, member health, and subscriber motion in parallel.

## SEO

- Dynamic metadata per page via Next.js `generateMetadata()`
- JSON-LD structured data (Organization, Article, BreadcrumbList) via `<JsonLd />` component
- Dynamic `sitemap.ts` includes all published content
- OpenGraph and Twitter meta tags with cover images
- Logo reference: `/logos/primary-color.png`

## Brand System

- **Runtime source of truth:** `src/styles/brand.css` (CSS custom properties)
- **Tailwind mirror:** `tailwind.config.ts` (hex values, NOT CSS vars — opacity modifiers require decomposable hex)
- **Brand guardrail:** `docs/brand/invariants.md`
- **Lens themes:** `src/lib/lens-theme.ts` maps lenses to Tailwind classes
- **Visual treatment:** halftone, duotone, grain, paper-texture CSS classes in `globals.css`

## Key Design Decisions

1. **Database-driven content** (not file-based MDX) — content is managed through the admin CMS, not code commits
2. **Tailwind hex duplication** — `tailwind.config.ts` must use hex values (not CSS vars) because opacity modifiers like `bg-bmj-red/10` require decomposable color values. A drift-detection hook guards against divergence.
3. **Single-author model** — all content defaults to "The Chairman" as sole author
4. **Blog serves Dispatches** — the `/blog` route intentionally renders dispatches, not articles. This is a branding decision.
5. **Independent access tiers** — courses and lessons have separate `access_tier` fields; a free course can contain premium lessons
6. **Server Components by default** — `'use client'` only when interactivity requires it
