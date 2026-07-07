---
name: bmj-content-authoring
description: Use when creating content records, managing the editorial pipeline, working with status workflows, or seeding the database. Triggers on "new article", "create briefing", "dispatch", "seed data", "editorial workflow", "publish", "draft".
---

# BMJ Content Authoring

How content is structured, created, and moved through the editorial pipeline.

## Doc context (Tier A/B)

Before changing rules: [AGENTS.md](../../AGENTS.md), [CLAUDE.md](../../CLAUDE.md), [docs/standards/agent-knowledge-protocol.md](../../docs/standards/agent-knowledge-protocol.md). **Task-scoped:** field-level truth in `src/lib/supabase/types.ts` and CLAUDE.md (Content Model); operator workflow in [docs/ops/publishing-sop.md](../../docs/ops/publishing-sop.md).

## Content types

Use `src/lib/supabase/types.ts` for Article, Briefing, Dispatch, Handbook, Download, Course, Lesson shapes. Seeds: `scripts/seed-all.ts`, `scripts/seed.ts`, and `supabase/seed-*.sql` per table.

## Status workflow

`draft → review → scheduled → published → archived → withdrawn` — meanings and gates match CLAUDE.md and admin publishing helpers (`src/lib/admin-publishing.ts`).

## Lenses

Exactly one lens per article: `health | politics | culture | entertainment | business`. Use `getLensTheme(lens)`; never hardcode lens colors.

## CLI and seeding

- `/new-article`, `/new-briefing` — SQL insert stubs for articles / briefings
- `npx tsx scripts/seed-all.ts` (full scripted tables) · `npx tsx scripts/seed.ts` (articles upsert)

## Author default and slugs

Default author: `"The Chairman"`. Slugs: kebab-case, unique per content type, used in URLs.
