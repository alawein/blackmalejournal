# Repo Cleanup & E2E UI/UX Audit — Design Spec

**Date:** 2026-03-27
**Approach:** Layer-by-Layer (Bottom-Up)
**Estimated scope:** ~50-70 file touches across 5 layers

---

## Overview

Full sweep of the BMJ codebase: remove dead code, add missing infrastructure (error/loading states), standardize component patterns, close accessibility gaps, and fix placeholder content. Each layer builds on the previous, producing clean testable checkpoints.

---

## Layer 1: Foundation — Dead Code & Cleanup

### 1a. Unused Component Audit

Grep every component for imports. Remove any with zero imports outside of tests:

- `TributeCard.tsx`
- `MagazineCoverHero.tsx`
- `RelatedArticles.tsx`
- `PosterBlock.tsx`
- `PullQuoteSidebar.tsx`
- `QuoteCard.tsx`

Update or remove tests that reference deleted components.

### 1b. Dead CSS Classes

- Remove unused `.lens-health`, `.lens-culture`, `.lens-politics`, `.lens-entertainment`, `.lens-business` utility classes from `globals.css` (components use `getLensTheme()` instead)
- Resolve `.page-shell` vs `.page-shell-tight` — if identical, consolidate to one and update all references

### 1c. Dead Exports / Barrel Files

- Check `src/lib/` for exported functions with zero consumers
- Check `src/components/ui/` for unused primitives

---

## Layer 2: Infrastructure — Error, Loading & Not-Found States

### 2a. Public Route Error Boundary

Add `src/app/(public)/error.tsx` — client component with BMJ-branded error state (BrandMark, "Something went wrong" message, retry button, back-to-home link). Match existing `(auth)/error.tsx` design language.

### 2b. Missing Loading States

Add `loading.tsx` to every route that lacks one:

| Route | Loading Pattern |
|-------|----------------|
| `/blog` (dispatches) | Card skeleton grid (3 cards) |
| `/records` | Section skeleton blocks |
| `/video` | Video card skeleton grid |
| `/contact` | Form skeleton |
| `/handbooks/[slug]` | Detail page skeleton |
| `/support` | Content skeleton |
| `/pricing` | Tier card skeleton row |
| `/privacy`, `/terms` | Text block skeleton |
| `/about`, `/about/ethics` | Text block skeleton |

Use existing `Skeleton` component from `src/components/ui/Skeleton.tsx`. Follow patterns established by existing loading files (e.g., `articles/loading.tsx`).

### 2c. Admin Loading States

- Add `src/app/(auth)/admin/loading.tsx` — dashboard skeleton
- Admin list pages — table skeleton with header row + 5 placeholder rows

### 2d. Dynamic Route Not-Found Verification

Verify all `[slug]` and `[id]` routes call `notFound()` when entity doesn't exist. Confirmed for articles, briefings, academy. Verify handbooks, downloads, blog/dispatches, admin edit pages.

---

## Layer 3: Standardization — Patterns & Consistency

### 3a. Button Standardization

Replace all inline button styling with existing `.btn-primary` / `.btn-secondary` / `.btn-ghost` classes. If a genuinely missing variant exists (e.g., small icon-only button), add it to globals.css as `.btn-*` rather than inlining.

### 3b. Filter Tab Normalization

Normalize all filter/tab components (`CategoryFilterTabs`, `DownloadCategoryTabs`, `TagFilterRow`) to use `.filter-tab` + modifier classes from globals.css. Same HTML structure, same ARIA pattern, same hover/active states as `LensFilterTabs`.

### 3c. Magic Numbers to Constants

Create `src/lib/constants.ts`:

| Current Location | Value | Constant Name |
|---|---|---|
| `Navbar.tsx` | `scrollY > 20` | `SCROLL_THRESHOLD_NAV` |
| `BackToTop.tsx` | `scrollY > 400` | `SCROLL_THRESHOLD_BACK_TO_TOP` |
| `FeaturedCarousel.tsx` | `6000` | `CAROUSEL_INTERVAL_MS` |
| `RotatingQuote.tsx` | `8000` | `QUOTE_ROTATION_INTERVAL_MS` |
| `ScrollReveal.tsx` | `0.15` | `SCROLL_REVEAL_THRESHOLD` |

### 3d. Animation Timing

Keep carousel and quote rotation at their current values (6s and 8s respectively) — but name them as constants so the intentionality is clear.

### 3e. Card Border Documentation

Add a comment block in globals.css above the card section explaining the intentional border hierarchy (print-inspired editorial variation).

---

## Layer 4: UX Polish — Accessibility & Interaction

### 4a. Search UX

- Add CSS keyframe spinner to SearchDialog loading state
- Wrap search results in `aria-live="polite"`
- Keep focus on input when results load
- Announce "No results found" to assistive tech

### 4b. Skeleton Screen Announcements

Add `aria-busy="true"` to parent container of each loading skeleton. Add visually-hidden `<span role="status">Loading...</span>` for screen readers.

### 4c. Form Accessibility

Verify proper `<label>` associations and error announcements in:
- Contact form, Login form, Signup form, Newsletter form, Search input

Fix missing `htmlFor`/`id` pairings. Add `aria-describedby` for inline errors. Add `aria-invalid="true"` on fields with validation errors.

### 4d. Icon Button Labels

Grep for `<button` without `aria-label`. Fix any gaps in icon-only buttons (bookmark, share, back-to-top, close, mobile menu toggle).

### 4e. Reduced Motion Consistency

Standardize to Framer Motion's `useReducedMotion()` in components that already import framer-motion. Keep manual `window.matchMedia` check in components that don't.

---

## Layer 5: Content Fixes — Links, Strings & Data

### 5a. Social Links Centralization

Add `SOCIAL_LINKS` constant to `src/lib/nav.ts`. Both Footer and MobileMenu import from same source. `href="#"` stays as placeholder but is defined once.

### 5b. Email Address Centralization

Add email constants (chairman@, privacy@, contact@) to `src/lib/seo.ts` or new `src/lib/contact.ts`. Replace all hardcoded references.

### 5c. Blog/Dispatches Link Verification

Verify `/blog/page.tsx` pagination links are correct (since `/blog` intentionally serves dispatches per CLAUDE.md).

### 5d. Metadata String Centralization

Add to `src/lib/seo.ts`:
```typescript
export const SITE_NAME = 'The Black Male Journal'
export const SITE_TAGLINE = 'Speak the Truth. Navigate the Consequences.'
```

Update all metadata exports to reference these constants.

---

## Success Criteria

- `npm run build` passes
- `npx tsc --noEmit` passes
- `npm run lint` passes
- `npm test` passes (updated tests for removed components)
- Every public route has `error.tsx`, `loading.tsx` coverage
- Zero inline button styles outside of globals.css component classes
- Zero magic numbers in UI components
- All icon-only buttons have `aria-label`
- All forms have proper label associations
- Social links and emails defined in one place each
- Metadata strings centralized
