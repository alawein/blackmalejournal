---
title: BMJ — Single Source of Truth
authority: canonical
status: canonical
audience: [chairman, operators, engineers, agents, partners, designers]
last-verified: 2026-04-09
---

# The Black Male Journal — Single Source of Truth

**Study Well. Speak the Truth. Navigate the Consequences.**

**Still canonical in code (do not paraphrase for production):** `src/styles/brand.css` (colors/CSS variables), `tailwind.config.ts` (hex mirrors), `src/lib/seo.ts` (live site strings), `src/lib/supabase/types.ts` (schema shapes). This file **duplicates** them here for humans who need a **single exportable spec**; if anything disagrees, **update code first**, then this file in the same change.

**Repo process:** [`AGENTS.md`](../AGENTS.md), [`CLAUDE.md`](../CLAUDE.md). **Doc hygiene / agent tiers:** [`standards/agent-knowledge-protocol.md`](standards/agent-knowledge-protocol.md).

---

## 1 — Institution & Mission

The Black Male Journal is an independent media house and revolutionary masculinist platform. It publishes long-form journalism, briefings, dispatches, academy courses, handbooks, downloads, and video — supported by a member portal with bookmarks, dynamic comments under articles, and billing.

The organization operates as a nonprofit-oriented entity. Incorporation, EIN, optional 501(c)(3) status, domain identity, banking, and operator security follow a phased ops lane (vault → legal/EIN → domain/email → banking → platforms).

> **Elevator pitch:** A serious editorial product for Black male thought, discipline, and power — not lifestyle fluff, not neutral aggregation. Every story sits within one of five editorial lenses.

---

## 2 — Business Model

| Channel | Detail |
|---------|--------|
| **Membership** | Free / Basic (~$9/mo) / Premium (~$19/mo) via Stripe Checkout + Customer Portal; webhook updates `members.tier` in Supabase |
| **Donations** | One-time and recurring; copy and handles centralized in `src/lib/seo.ts` |
| **Patreon** | https://patreon.com/BlackMaleJournal |
| **Cash App / Venmo / PayPal** | $BlackMaleJournal / @BlackMaleJournal / paypal.me/BlackMaleJournal |

### Tier Entitlements

| Tier | Access |
|------|--------|
| **free** | Public articles, briefing previews, video gallery, academy catalog. No downloads without signing up (previews only). |
| **basic** | Full briefing archive, select handbooks, member resources. One handbook/toolkit download. |
| **premium** | All handbooks, downloads, gated content, early access. Unlimited handbook/toolkit downloads. |

> **Code rule:** Never compare tier strings by hand — use `includesTier` / `compareTiers` in `src/lib/membership.ts`.

---

## 3 — Public Identity

| Field | Value |
|-------|-------|
| Organization | The Black Male Journal |
| Tagline | Study Well. Speak the Truth. Navigate the Consequences. |
| Default author | The Chairman |
| General email | chairman@blackmalejournal.org |
| Privacy email | privacy@blackmalejournal.org |
| Support email | contact@blackmalejournal.org |

Verbal identity is mirrored from `src/lib/seo.ts`. The Chairman-facing consistency checklist lives at [`ops/chairman-consistency-reference.md`](ops/chairman-consistency-reference.md).

---

## 4 — Editorial Lenses

Every piece of content uses exactly one lens. UI accents come from `LENS_THEMES` in `src/lib/lens-theme.ts`.

| Lens | Label | Tailwind Class | Hex | Topics |
|------|-------|----------------|-----|--------|
| `health` | Health / Wellness | `bmj-amber` | `#C8852A` | Physical/mental wellness, martial arts, discipline |
| `politics` | Politics / Law | `bmj-red` | `#C0281F` | Power, policy, systems, organizing |
| `culture` | Culture / Ideology | `bmj-tan` | `#B8986A` | Philosophy, identity, ideology, cultural analysis |
| `entertainment` | Media / Entertainment / Technology | `bmj-purple` | `#554978` | Media, technology, reviews |
| `business` | Business / Finance | `bmj-olive` | `#416100` | Finance, economics, entrepreneurship, career |

> **Code rule:** Use `getLensTheme(lens)` for UI — never hardcode lens colors in components.

---

## 5 — Art Direction & Brand Attributes

BMJ looks like revolutionary editorial culture — militant in posture, print-led in execution, ideologically direct. Its lineage draws from liberation-era newspapers, political posters, movement literature, and mimeograph logic. The reader should feel addressed, challenged, and summoned into seriousness.

**Brand attributes:** Militant · Confrontational · Print-born · Masculine · Pan-African · Doctrinal · Editorially authoritative · Uncompromising

**Seven visual principles:**

1. **Militant discipline** — order, heavy type, strong silhouettes
2. **Confrontational clarity** — headlines as declarations
3. **Revolutionary print lineage** — not startup polish
4. **Tactile materiality** — grain, halftone, paper warmth
5. **Masculine gravitas** — restraint, geometry, contrast
6. **Pan-African historical consciousness** — iconic portraiture, movement visuals
7. **Editorial authority** — journal/briefing organ, not generic content brand

Full spec: [`brand/art-direction-spec.md`](brand/art-direction-spec.md) · Movement literature spec: [`brand/movement-literature-spec.md`](brand/movement-literature-spec.md) · Implementation law: [`brand/invariants.md`](brand/invariants.md)

---

## 6 — Design Tokens

All values are canonical in `src/styles/brand.css`. Tailwind hex in `tailwind.config.ts` must mirror exactly.

### Core Palette

| Token | Hex | Role |
|-------|-----|------|
| `--bmj-black` | `#0D0C0B` | Structural canvas |
| `--bmj-cream` | `#E8DCC8` | Body text warmth |
| `--bmj-red` | `#C0281F` | Command, CTAs, urgency |
| `--bmj-amber` | `#C8852A` | Secondary / health lens |
| `--bmj-brown` | `#3B2417` | Secondary |
| `--bmj-tan` | `#B8986A` | Secondary / culture lens |
| `--bmj-white` | `#F2EDE4` | Paper highlight |

### Extended Accents

| Token | Hex | Note |
|-------|-----|------|
| `--bmj-paper` | `#F0DDBC` | Lighter paper ground, cards |
| `--bmj-deep-black` | `#1C130E` | Heavier typographic weight |
| `--bmj-crimson` | `#712414` | Politics accent |
| `--bmj-medium-brown` | `#5D3F2E` | Culture / editorial accent |
| `--bmj-olive` | `#416100` | Business lens accent |
| `--bmj-gold` | `#C77A0E` | Finance accent |
| `--bmj-purple` | `#554978` | Entertainment / technology lens |

### Typography

| Role | Stack |
|------|-------|
| Display / headlines | Highrise → Bebas Neue (`font-display`) — uppercase |
| Body | Libre Baskerville (`font-body`) |
| Labels / buttons | Oswald (`font-label`) — uppercase, wide tracking |
| Dates / stamps | IBM Plex Mono (`font-mono`) — *under review: seeking a more typewriter-like alternative (e.g., Courier Prime)* |
| Literature Meta | IBM Plex Mono / Oswald |

### Key Metrics

| Variable | Value |
|----------|-------|
| `--leading-article` | 1.8 |
| `--grain-opacity` | 0.09 |
| `--width-content` | 1200px |
| `--width-article` | 720px |
| `--width-wide` | 1440px |

---

## 7 — Logo System

| Asset | Use |
|-------|-----|
| Primary logo | Wordmark + journal/book icon — OG, about, print |
| Alternate | Compact wordmark + journal/book icon + tagline — social, tight spaces |
| Submark | Book + star + pen nib — watermark, small UI |
| Favicon | Simplified star + pen nib |

Files live in `public/logos/` (naming: `{type}-{variant}.{ext}`), `public/favicon.svg`, `public/og-image.svg`. The `<BrandMark />` component is the canonical inline SVG. Use `src/lib/images.ts` for centralized paths. Placeholders: `public/placeholders/*.svg` via `PLACEHOLDERS` in `src/lib/placeholders.ts`.

Visual identity index (logos, placeholders, palette reference): [`brand/visual-ssot.md`](brand/visual-ssot.md).

---

## 8 — UI Rules (Non-Negotiable)

- **No** drop shadows, gradients, or glassmorphism (except minimal nav scroll)
- **No** border radius above 4px — `rounded` and `rounded-sm` only
- **Global grain** on the shell — never duplicate a second full-screen instance
- **All editorial images** must use `TreatedImage` variants (halftone / duotone) — no raw stock
- **`<StarDivider />`** between major sections
- **Prohibited:** lifestyle grin stock, generic SaaS pills, soft white card boxes, random icon soup, hover states that soften visual weight

Full list: [`brand/invariants.md`](brand/invariants.md)

---

## 9 — Services & Surfaces

### Public (marketing + editorial)

| Path | Service |
|------|---------|
| `/` | Homepage |
| `/articles` `/articles/[slug]` | Long-form articles |
| `/briefings` `/briefings/[slug]` | Weekend Briefing issues |
| `/blog` `/blog/[slug]` | Dispatches (short-form; `/blog` is intentional branding) |
| `/academy` `/academy/[slug]` `/academy/.../lesson` | Courses and lessons |
| `/handbooks` `/handbooks/[slug]` | Handbook library |
| `/downloads` | Download library |
| `/records` | Records hub |
| `/video` | Video gallery |
| `/search` | Global search |
| `/about` `/about/ethics` | About and ethics |
| `/contact` `/support` | Contact and support |
| `/brand/movement-literature` | Movement Literature showcase |
| `/pricing` | Membership pricing |
| `/privacy` `/terms` | Legal |

### Auth & Account

| Path | Service |
|------|---------|
| `/login` `/signup` | Authentication |
| `/auth/callback` | OAuth / session callback |

### Member Portal

| Path | Service |
|------|---------|
| `/portal` | Portal home |
| `/portal/settings` | Profile and subscription management |
| `/portal/bookmarks` | Saved content |

### Admin CMS

| Path | Service |
|------|---------|
| `/admin` | Command center — metrics, attention queue, shortcuts |
| `/admin/articles` | Articles CRUD |
| `/admin/briefings` | Briefings CRUD |
| `/admin/dispatches` | Dispatches CRUD |
| `/admin/handbooks` | Handbooks CRUD |
| `/admin/downloads` | Downloads CRUD |
| `/admin/courses` | Courses + nested lessons CRUD |
| `/admin/members` | Members |
| `/admin/subscribers` | Subscriber list tooling |
| `/admin/messages` | Inbound message triage |
| `/admin/campaigns` | Email / campaign tooling |

### Service Axes

| Axis | Core Question | Primary Surfaces |
|------|---------------|-----------------|
| Editorial production | What gets written next? | `/admin/*` content domains |
| Editorial distribution | How do readers discover work? | Homepage, listings, detail routes, search |
| Education | How does knowledge compound? | `/academy/*` |
| Membership conversion | How do readers become supporters? | `/pricing`, paywall gates, CTAs |
| Membership retention | Why do paying members stay? | `/portal`, bookmarks, depth content |
| Audience operations | How are messages/subscribers handled? | `/admin/messages`, `/admin/subscribers` |
| Revenue operations | Is billing healthy? | Stripe checkout/webhook/portal, `/admin/members` |
| Governance & trust | Is the institution coherent? | Legal routes, docs SSOT, env/secrets |

### Admin Dashboard Mechanics

The admin home (`/admin`) is an action dashboard that computes pressure and routes operator attention. Key signals from `src/lib/admin-insights.ts`:

| Signal | Rule |
|--------|------|
| Overdue inbox | Message `new` or `in_progress` and ≥ 3 days old |
| Stale draft/review | Content in `draft`/`review` older than 14 days |
| Scheduled issue | Missing publish time or past publish time → critical |
| Scheduled soon | Publish time within next 7 days |
| Billing exception | Non-free tier with missing Stripe customer or subscription ref |
| Subscriber net | Net past 30 days negative → warning |

Every warning maps to a reachable admin route so the operator can clear risk without manual hunting.

---

## 10 — Content Model

**Types:** Articles, Briefings (structured sections), Dispatches, Handbooks, Downloads, Courses, Lessons, Members. Full shapes: `src/lib/supabase/types.ts`.

**Status workflow:** `draft → review → scheduled → published → archived → withdrawn`

**Access control:** Each content row carries `access_tier`; gating uses `checkContentAccess` and `PaywallGate` on public pages.

---

## 11 — Technical Stack

| Layer | Technology |
|-------|-----------|
| App | Next.js 16 App Router, React 19, TypeScript strict |
| Styling | Tailwind + `brand.css` variables |
| Data | Supabase (Postgres, Auth, Storage) |
| Payments | Stripe |
| Email | Resend |
| Hosting | Vercel |
| Analytics | Plausible (optional) |

> **Security:** Service-role Supabase and Stripe secrets are server-only — never `NEXT_PUBLIC_*`. Full env catalog: [`ops/env-vars.md`](ops/env-vars.md).

---

## 12 — Roadmap

### Shipped

| Priority | Plan |
|----------|------|
| P1 | Search enhancement |
| P2 | Member bookmarks |
| P3 | Email campaigns (admin) |
| — | Admin command center |

### In Progress

| Item | Status |
|------|--------|
| P4 — Repo cleanup / UI audit | Residual layers per plan |

External blockers (dashboards, DNS, Stripe products): [`DEFERRALS.md`](DEFERRALS.md)

---

## 13 — Quality Gates

Before any release: `npm run lint` · `npx tsc --noEmit` · `npm test` · `npm run build` · `npm run test:e2e` · `verify:docs-links` · `verify:docs-frontmatter` · `secrets:check`

Details: [`CLAUDE.md`](../CLAUDE.md), [`DEVELOPER.md`](DEVELOPER.md).

---

## 14 — Governance Invariants

| ID | Rule |
|----|------|
| I-1 | One truth per domain — tokens in `brand.css`, env in [`ops/env-vars.md`](ops/env-vars.md), types in `types.ts`, this file for human SSOT |
| I-2 | Tailwind hex mirrors `brand.css` |
| I-3–I-7 | Commits, scope, entropy, refusal, minimal `NEXT_PUBLIC_` — see [`AGENTS.md`](../AGENTS.md) |

---

## 15 — Code Authority

This document duplicates runtime values for human reference. When anything disagrees, update code first, then this file in the same change.

| Domain | Canonical File |
|--------|---------------|
| Colors / CSS variables | `src/styles/brand.css` |
| Tailwind hex mirrors | `tailwind.config.ts` |
| SEO / site strings | `src/lib/seo.ts` |
| Database schema | `src/lib/supabase/types.ts` |
| Route paths | `src/lib/paths.ts` |
| Lens styling | `src/lib/lens-theme.ts` |
| Tier logic | `src/lib/membership.ts` |
| Repo process | [`AGENTS.md`](../AGENTS.md), [`CLAUDE.md`](../CLAUDE.md) |

---

## 16 — Revision Log

| Date | Note |
|------|------|
| 2026-04-09 | Rewrote as clean, structured SSOT. Updated tagline to "Study Well. Speak the Truth. Navigate the Consequences." Updated emails to .org domain. Expanded tier entitlements with download rules. Added IBM Plex Mono review note. Added §15 Code Authority table. Wired all cross-references as relative links. |
| 2026-03-31 | Expanded into substantive SSOT: nonprofit/business, tokens, vibe, lenses, services (public/member/admin), dashboard/admin routes, integrations. |
| 2026-03-31 | Prior: single-file program SSOT. |
