---
type: normative
authority: canonical
audience: [agents, contributors]
last-updated: 2026-10-04
---

# The Black Male Journal: contributor instructions

Start with [README.md](README.md). Check Git status and preserve existing work. Read the relevant
source and tests before editing; keep each change focused. [CLAUDE.md](CLAUDE.md) is a pointer to
this file.

## Source ownership

- Application routes live in `src/app/`; use App Router and Server Components by default.
- `src/lib/paths.ts` owns routes; rename links, navigation, sitemap, fallbacks, and tests together.
- Supabase types, queries, and migrations own the content model. `/blog` intentionally serves
  Dispatches.
- Use `includesTier` and `compareTiers` for membership; do not compare tier strings by hand.
- `src/styles/brand.css` owns brand tokens; `tailwind.config.ts` mirrors hex values for opacity
  modifiers.
- Use `LENS_THEMES`, `LOGOS`, `PLACEHOLDERS`, and image helpers instead of duplicating values.
- [Brand invariants](docs/brand/invariants.md) and [visual identity](docs/brand/visual-ssot.md) own
  visual rules.
- [Environment reference](docs/ops/env-vars.md) owns variable names and integration setup.
- The product reference and historical material supply context; code owns runtime values.

## Constraints

- Keep strict TypeScript, Zod validation, existing auth guards, access tiers, and rate limits.
- Tailwind colors must follow brand tokens. Preserve reduced motion, focus behavior, and licensed
  assets.
- This app has no shared external token dependency. A migration needs an architectural decision,
  exact token parity, and updated tests and docs before adoption.
- Keep conventional commits and explicit staging paths; do not mix unrelated work.
- Never commit credentials or real environment files. Server secrets must never use `NEXT_PUBLIC_`.
- Supabase service-role credentials bypass RLS and remain server-only.
- Account changes, sends, spending, deployment, and repository publishing require named
  authorization.
- When adding an integration, update the environment reference. Service accounts use organization
  aliases.

## Validation

For behavior changes, run lint, TypeScript, affected tests, and a production build; check affected
pages at mobile and desktop sizes. Preserve all CI security checks. For documentary changes, run
canonical-location, local-link, and frontmatter checks listed in README. Report what actually ran
and any remaining limitations.

After route moves, clear only the generated `.next` type cache if stale route types block
validation. On Windows, terminate only the dev-server process you own. Do not replace meaningful
validation with file-count quotas or duplicated documents.

Branch hygiene: `main` deploys; preserve frozen `v0/*`. Flag inactive topic branches after 7 days and aim to integrate or explicitly park them within 14 days. Delete, archive, or prune only with named owner approval; preserve useful unmerged work and dirty worktrees.
