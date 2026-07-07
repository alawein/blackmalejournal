# The Black Male Journal

An independent media house and revolutionary masculinist platform. Built with Next.js 16, TypeScript, Tailwind CSS, Supabase, and Stripe. Deployed on Vercel.

**Tagline:** Speak the Truth. Navigate the Consequences.

## Quick Start

```bash
git clone https://github.com/blackmalejournal/blackmalejournal.git
cd blackmalejournal
npm install
cp .env.example .env.local   # fill in values — see docs/ops/env-vars.md
npm run dev                   # http://localhost:3000
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Jest (136 suites, 1185 tests) |
| `npm run test:e2e` | Playwright E2E |
| `npm run verify:docs-links` | Validate relative links under `docs/` (CI) |
| `npm run verify:docs-frontmatter` | Require YAML frontmatter on `docs/ops/`, `docs/brand/`, and root `docs/*.md` (CI) |
| `npm run verify:docs-ops-frontmatter` | Ops lane only (same checker) |
| `npm run verify:docs-brand-frontmatter` | Brand lane only (same checker) |
| `npm run verify:docs-root-frontmatter` | Root `docs/*.md` only (same checker) |
| `npm run docs:inventory` | Print Markdown counts by bucket (sprawl / inventory) |
| `npm run docs:duplicate-audit` | Heuristic near-duplicate pairs under `docs/` (informational; optional `--fail`) |
| `npm run docs:duplicate-audit:ci` | Short duplicate-audit report (used in CI; `--max-report=5`) |
| `npm run docs:layout` | Shallow directory tree of key folders (see `docs/ARCHITECTURE.md`) |
| `npx tsc --noEmit` | TypeScript check |

## Architecture at a Glance

```
src/
  app/
    (public)/     Public pages (articles, briefings, academy, blog, etc.)
    (auth)/       Login, signup, member portal, admin panel
    api/          API routes (Stripe, contact, newsletter, search)
  components/     UI primitives, brand, content cards, layout, admin
  lib/            Supabase client/queries, Stripe config, membership, SEO
  styles/         Brand CSS variables, global styles
public/
  logos/          Brand identity assets
  placeholders/   Content-type fallback images
  textures/       CSS background patterns
  fonts/          Self-hosted typefaces
```

**Database:** Supabase (PostgreSQL + Auth + Storage)
**Payments:** Stripe (subscriptions + one-time donations)
**Email:** Resend (transactional)
**Analytics:** Plausible (optional)

## Content Types

| Type | Route | Description |
|------|-------|-------------|
| Articles | `/articles` | Long-form editorial, categorized by lens |
| Briefings | `/briefings` | Weekend Briefing — flagship magazine format |
| Dispatches | `/blog` | Short-form posts (blog route serves dispatches) |
| Handbooks | `/handbooks` | Deep-dive reference guides |
| Courses | `/academy` | Structured learning with lessons |
| Downloads | `/downloads` | Downloadable resources (PDFs, templates) |

## Membership Tiers

- **Free** — public articles, briefing previews, video gallery, academy
- **Basic** ($9/mo) — full briefing archive, select handbooks
- **Premium** ($19/mo) — everything: all handbooks, downloads, early access

## Documentation

| Document | Audience | Purpose |
|----------|----------|---------|
| **[docs/BMJ-SSOT.md](docs/BMJ-SSOT.md)** | **Everyone** | **Single comprehensive SSOT** — product, program, roadmap, where truth lives (**share this file**) |
| [docs/README.md](docs/README.md) | Everyone | Map of `docs/`, lanes, and governance entry points |
| [docs/DEVELOPER.md](docs/DEVELOPER.md) | Developers | Local setup, testing, deployment |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Developers | System design, data flow, schema, **repo root layout** |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Contributors | Code style, PR process, conventions |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Everyone | Common issues and fixes |
| [docs/ops/chairman-consistency-reference.md](docs/ops/chairman-consistency-reference.md) | Admin/Operator | Domains, emails, handles, brand strings, lenses, consistency checklists |
| [docs/ops/env-vars.md](docs/ops/env-vars.md) | DevOps | Environment variable reference |
| [docs/brand/invariants.md](docs/brand/invariants.md) | Designers | Visual identity rules |
| [docs/standards/README.md](docs/standards/README.md) | Platform / multi-repo leads | Optional **Repo Excellence Program** reference (templates, rollout, governance) — not required for routine BMJ app work |
| [CLAUDE.md](CLAUDE.md) | AI assistants | Project instructions for Claude Code |
| [tests/README.md](tests/README.md) | Developers | Test folder layout and commands |
| [scripts/README.md](scripts/README.md) | Developers | Verify scripts, seeds, `docs:layout` |

## For the Admin (Non-Technical Operator)

The admin panel at `/admin` is a complete no-code CMS. You can:

- Write, edit, schedule, and publish all content types through the UI
- Upload cover images via drag-and-drop
- Manage members and subscriptions
- Handle contact form submissions
- Export subscriber lists
- Monitor editorial pipeline, audience metrics, and billing health

**Start here:** [Chairman Consistency Reference](docs/ops/chairman-consistency-reference.md)

## Emergency: If the Developer Is Unavailable

1. **The site runs itself.** Vercel auto-deploys from `main`. Supabase handles the database. Stripe handles billing. No manual intervention needed for day-to-day operations.

2. **Content management** is fully UI-driven via `/admin`. No code changes needed to publish, edit, or manage content.

3. **If something breaks:**
   - Check [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for common fixes
   - Check Vercel dashboard for deployment status
   - Check Supabase dashboard for database health
   - Check Stripe dashboard for billing issues

4. **If you need a developer:**
   - This repo is a standard Next.js 16 app — any Next.js developer can work on it
   - All architecture decisions are documented in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
   - All conventions are in [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) and [CLAUDE.md](CLAUDE.md)
   - Environment setup takes ~10 minutes with [docs/DEVELOPER.md](docs/DEVELOPER.md)

## License

Proprietary. All rights reserved.
