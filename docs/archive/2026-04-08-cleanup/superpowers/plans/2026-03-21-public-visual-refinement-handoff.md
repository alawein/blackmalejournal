# Public Visual Refinement — Handoff

Date: 2026-03-21
Status: In progress, but stable and verified
Scope: Public-facing BMJ visual-system refinement pass across shared primitives plus home, articles, briefings, library, pricing, and about

## What Changed

The public visual pass is now centered around shared semantic tokens and reusable editorial primitives instead of page-local styling drift.

Core system files:

- `src/lib/lens-theme.ts` adds the canonical lens accent map used by badges, cards, and section accents.
- `src/styles/brand.css` adds semantic surface/text/border tokens on top of the raw palette.
- `src/styles/globals.css` adds the main reusable public primitives:
  - `page-shell`, `editorial-kicker`, `page-title`, `section-title`, `editorial-deck`, `meta-stamp`
  - `card-media`, `card-stripe`, `card-feature`
  - `card-offer`
  - `section-empty-state`
  - `filter-tab`, `filter-chip`, and button variants
- `src/components/layout/PageHeader.tsx` was generalized and stabilized so shared page headers can be reused without one-off layout overrides.

Public surface conversions already in the worktree:

- Home/public shell:
  - `src/components/layout/Navbar.tsx`
  - `src/components/layout/Footer.tsx`
  - `src/components/layout/MobileMenu.tsx`
  - `src/components/layout/UserDropdown.tsx`
  - `src/app/layout.tsx`
- Shared content/card/filter components:
  - `src/components/brand/LensBadge.tsx`
  - `src/components/content/ArticleCard.tsx`
  - `src/components/content/BriefingCard.tsx`
  - `src/components/content/DispatchCard.tsx`
  - `src/components/content/NewspaperGrid.tsx`
  - `src/components/content/QuoteCard.tsx`
  - `src/components/content/LensFilterTabs.tsx`
  - `src/components/content/TagFilterRow.tsx`
- Home sections:
  - `src/components/home/BriefingPreview.tsx`
  - `src/components/home/FeaturedCarousel.tsx`
  - `src/components/home/LatestDispatches.tsx`
  - `src/components/home/ThreeLenses.tsx`
  - `src/components/home/JoinCTA.tsx`
- Public pages:
  - `src/app/(public)/articles/page.tsx`
  - `src/app/(public)/briefings/page.tsx`
  - `src/app/(public)/library/page.tsx`
  - `src/app/(public)/pricing/page.tsx`
  - `src/app/(public)/about/page.tsx`

## What Was Finished In The Last Pass

- `PageHeader` no longer changes title scale based on the presence of a label.
- `PageHeader` icon/title layout now stacks more gracefully and avoids cramped single-row treatment.
- `TagFilterRow` now uses centralized chip tokens instead of layering hardcoded local colors on top.
- Pricing plans now use a quieter `card-offer` surface instead of reusing the more editorial `card-media` feel.
- About now has one resolved intro block instead of a logo intro followed by a second full intro header.
- Library hub cards now use semantic lens accents instead of a single red fallback.
- Home empty states for briefing/featured/dispatch sections now share one treatment.

## Verification Completed

These commands passed after the latest edits:

- `npm run build`
- `npm test -- --runInBand tests/components/ArticleCard.test.tsx tests/components/QuoteCard.test.tsx`
- `npx playwright test tests/e2e/home.spec.ts --project=chromium --reporter=line`

## Known Issues

The Playwright/webserver run still logs existing query warnings unrelated to this visual pass:

- `getLatestDispatches` references `dispatches.status`
- `getFeaturedArticles` references `articles.status`

The home-page UI still rendered and the E2E checks passed, but those query warnings should be cleaned up separately.

## Worktree Notes

The repository is dirty beyond this refinement pass.

Unrelated docs work is also present in the worktree:

- `docs/ops/backup-restore.md`
- `docs/ops/chairman-operator-manual.md`
- `docs/ops/env-audit.md`
- `docs/ops/release-sequence.md`
- multiple new docs index/readme files under `docs/`

Do not blindly revert the worktree. Separate the public UI changes from the docs changes when preparing commits unless there is an explicit reason to bundle them.

## Recommended Next Session Todo List

- Do a visual QA sweep in a browser for:
  - `/`
  - `/articles`
  - `/briefings`
  - `/library`
  - `/pricing`
  - `/about`
- Check spacing rhythm and typography specifically on mobile widths after the new `PageHeader` behavior.
- Decide whether `JoinCTA.tsx`, `SearchDialog.tsx`, and `EmptyState.tsx` need one more polish pass for perfect consistency with the new primitives.
- Clean up the Supabase query warnings around `articles.status` and `dispatches.status`.
- Prepare commit boundaries:
  - one commit for public visual refinement
  - separate commit for docs lane changes if those are intentional

## Suggested Restart Prompt

Use this in the next IDE/session:

```text
Continue the BMJ public visual refinement pass from docs/superpowers/plans/2026-03-21-public-visual-refinement-handoff.md.
First, inspect git status and review the modified public UI files plus the unrelated docs changes.
Do a browser QA sweep of /, /articles, /briefings, /library, /pricing, and /about.
Then fix any remaining consistency issues and clean up the existing query warnings for articles.status and dispatches.status if they are still present.
Do not revert unrelated docs work.
```
