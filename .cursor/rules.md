# Cursor Rules for The Black Male Journal

You are working in the blackmalejournal repository -- a Next.js 16 web application for The Black Male Journal, an independent media house and revolutionary masculinist platform.

## Tech Stack

Next.js 16 (App Router), TypeScript (strict), Tailwind CSS, Supabase, Stripe, Framer Motion, Zod, Vercel deployment.

## Context

- Config: [CLAUDE.md](../CLAUDE.md), [AGENTS.md](../AGENTS.md)
- Brand tokens: [src/styles/brand.css](../src/styles/brand.css)
- Operations: [docs/ops/](../docs/ops/)

## Brand Constraints (Non-Negotiable)

- Only `--bmj-*` CSS variables from `src/styles/brand.css`
- Highrise (headlines, ALL-CAPS), Libre Baskerville (body), Oswald (labels), IBM Plex Mono (dates)
- PROHIBITED: pastels, gradients, blue, neon, rounded corners > 4px, drop shadows, glassmorphism
- Visual: Militant print-driven editorial -- revolutionary newspapers, political posters
- Three lenses only: health, philosophy, politics

## Work Style

- Execute incrementally. Small, complete changes.
- Read CLAUDE.md before structural changes.
- Server Components by default, "use client" only when needed.
- Tailwind for all styling -- no CSS modules, no styled-components.
- No cross-project file access.

## Testing

Before committing:
- `npm run build` must pass
- `npm run lint` clean
- `npm test` passes
- `npx tsc --noEmit` passes

## Do Not

- Commit unverified changes
- Scope creep (refuse multi-file changes for single-sentence tasks)
- Assume file existence; verify with `ls` first
- Use NEXT_PUBLIC_ prefix for server-only secrets
- Deviate from the brand system in any way
