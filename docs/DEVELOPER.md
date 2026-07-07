---
title: Developer guide
status: canonical
audience: [engineers, contributors]
last-verified: 2026-04-08
---

# Developer Guide

> Getting started with The Black Male Journal codebase.

## Prerequisites

- **Node.js** 20+ locally; **CI** uses **22** (Active LTS) — match CI for fewest surprises
- **npm** (comes with Node.js)
- **Git**

## Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/blackmalejournal/blackmalejournal.git
   cd blackmalejournal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

   If you switch between Windows and WSL/Linux/macOS on the same checkout, rerun `npm install` in the active environment before running tests or builds. Next.js ships platform-specific SWC binaries, and a `node_modules` tree installed on one OS can fail on another.

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your values — see [docs/ops/env-vars.md](ops/env-vars.md) for details on each variable.

4. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Repository scripts

Automation and seeds live in [`scripts/`](../scripts/README.md) (verify helpers, Jest counts, repo layout printer, TypeScript seed runners). See that README for `npm run` mappings and `npx tsx` usage.

## Testing

**Test layouts:** [tests/README.md](../tests/README.md) (repo root).

### Unit & Integration Tests (Jest)

```bash
npm test                 # Run all tests
npm run test:counts      # Print suite/test totals for README / CLAUDE.md
npm run test:watch       # Watch mode
npm test -- --coverage   # With coverage report
npm run verify:docs-links # Relative links in docs/
```

### Documentation

```bash
npm run docs:layout        # Shallow tree of key dirs (see docs/ARCHITECTURE.md for narrative)
```

### E2E Tests (Playwright)

```bash
npm run test:e2e      # Run E2E tests
```

### Type Checking

```bash
npx tsc --noEmit
```

## Code Quality

```bash
npm run lint          # ESLint
npm run secrets:check # Scan for leaked secrets
```

## Deployment

- **Production**: Auto-deploys on push to `main` via Vercel
- **Preview**: Every PR gets a preview deployment
- **Manual**: Use the Vercel Dashboard

## Environment Variables

See [docs/ops/env-vars.md](ops/env-vars.md) for the canonical environment variable list.

## Architecture

### App Router (Next.js 16)

- `src/app/(public)/` — Public pages (articles, briefings, academy, etc.)
- `src/app/(auth)/` — Auth pages (login, signup) and portal
- `src/app/api/` — API routes (Stripe, contact, newsletter)

### Components

- `src/components/ui/` — Primitives (StarDivider, GrainOverlay, ShareButton)
- `src/components/brand/` — Brand elements (LensBadge)
- `src/components/content/` — Content cards and display components
- `src/components/layout/` — Navbar, Footer, MobileMenu
- `src/components/portal/` — Member portal components

### Content Taxonomy

All content is categorized under one of five **lenses**:
- **Health** — physical/mental wellness, martial arts, discipline
- **Politics** — power, policy, systems, community organizing
- **Culture** — philosophy, identity, ideology, cultural analysis
- **Entertainment** — media, technology, reviews
- **Business** — entrepreneurship, finance, economics, ownership

### Access Tiers

- **Free** — Public articles, briefing previews, video gallery
- **Basic** — Full briefing archive, select handbooks
- **Premium** — Everything (all handbooks, downloads, early access)

## Optional: REP governance verification

If you are validating **Repo Excellence Program** GitHub Issue Forms and the `documentation` label (requires [GitHub CLI](https://cli.github.com/) and `gh auth login`):

```bash
npm run verify:rep-governance
```

**CI** verifies Issue Form files on disk; a **local** run also checks the `documentation` label via `gh` (the Actions token cannot list labels in many setups).

## Conventions

### Brand System

Colors, fonts, and visual guidelines are defined in `CLAUDE.md`, `docs/brand/invariants.md`, and `src/styles/brand.css`. Never deviate from the brand system.

### File Naming

- Components: `PascalCase.tsx`
- Pages: lowercase
- Utilities: `camelCase.ts`
- Content: `kebab-case.mdx`

### Git Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add Weekend Briefing archive with lens filter
fix: correct fee calculation in donation flow
chore: update dependencies
```
