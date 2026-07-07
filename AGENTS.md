---
type: normative
authority: canonical
audience: [agents, contributors]
last-verified: 2026-04-08
---

# AGENTS -- The Black Male Journal Governance

> **Status: Normative.** Do not modify without explicit review.

This project follows the **Morphism Categorical Governance Framework**.

## Governance Source

| Authority | Location |
|-----------|----------|
| Root governance | [AGENTS.md](AGENTS.md) (this file) |
| Project instructions | [CLAUDE.md](CLAUDE.md) |
| Agent/contributor doc tiers (A–D) and conflict order | [docs/standards/agent-knowledge-protocol.md](docs/standards/agent-knowledge-protocol.md) |
| **BMJ comprehensive documentation SSOT** | [docs/BMJ-SSOT.md](docs/BMJ-SSOT.md) |
| Brand invariants | [docs/brand/invariants.md](docs/brand/invariants.md) |
| Visual identity index (tokens, logos, placeholders, lenses) | [docs/brand/visual-ssot.md](docs/brand/visual-ssot.md) |
| Operations | [docs/ops/](docs/ops/) |
| Repository governance reference | [docs/standards/README.md](docs/standards/README.md) (optional; use for cross-repo/platform alignment) |

## Scope

This file governs the blackmalejournal repository -- a Next.js 16 web application for The Black Male Journal media platform, deployed on Vercel with Supabase backend.

| Directory | Governance Level | Notes |
|-----------|-----------------|-------|
| `src/app/` | **Application** | Next.js App Router -- routes, layouts, API |
| `src/components/` | **UI** | Brand components, content cards, layout |
| `src/lib/` | **Library** | Supabase queries, Stripe config, utilities |
| `src/styles/` | **Brand** | CSS custom properties, globals -- brand SSOT |
| `supabase/` | **Database** | Migrations, seed data, config |
| `tests/` | **Testing** | Jest + Playwright — [`tests/README.md`](tests/README.md) |
| `docs/` | **Documentation** | Operations, brand, audits |
| `public/` | **Assets** | Logos, fonts, images |
| `scripts/` | **Automation** | [`scripts/README.md`](scripts/README.md) — verify, seeds, layout |

## Seven Invariants

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| I-1 | One Truth Per Domain | `src/styles/brand.css` is SSOT for brand **tokens**; `docs/brand/visual-ssot.md` indexes logos, placeholders, lenses; `docs/ops/env-vars.md` is SSOT for env vars |
| I-2 | Drift Is Debt | Brand tokens in `tailwind.config.ts` must mirror `brand.css`; run `/brand-check` |
| I-3 | Observability | Log what changed, why, who, when -- conventional commits required |
| I-4 | Scope Binding | Changes must have clear, narrow boundaries -- one logical unit per commit |
| I-5 | Entropy Monotonicity | Do not increase complexity without explicit justification |
| I-6 | Refusal as Structure | Refuse scope creep -- no "while we're at it" changes |
| I-7 | Minimal Authority | Fewest permissions needed; server-only secrets never get NEXT_PUBLIC_ prefix |

## Protocol

1. Read CLAUDE.md and brand invariants before structural changes
2. State the one thing you are building
3. Verify the path (which files, which routes)
4. Execute incrementally
5. Refuse scope creep

**Deeper layout (repo root, `docs/` lanes, tooling paths):** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — *Repository layout — monorepo root*. **Documentation hygiene:** counts `npm run docs:inventory`; SSOT frontmatter for `docs/ops/`, `docs/brand/`, and root `docs/*.md` via `npm run verify:docs-frontmatter` (CI). Agent context tiers: [docs/standards/agent-knowledge-protocol.md](docs/standards/agent-knowledge-protocol.md).

See [CLAUDE.md](CLAUDE.md) for brand constraints, validation commands, content model, and architecture rules.
