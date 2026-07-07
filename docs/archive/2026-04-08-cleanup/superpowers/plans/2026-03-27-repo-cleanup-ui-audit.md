# Repo Cleanup & E2E UI/UX Audit — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove dead code, add missing error/loading infrastructure, standardize component patterns, close accessibility gaps, and centralize placeholder content across the full BMJ front-end.

**Architecture:** Five-layer bottom-up approach. Layer 1 removes dead code so subsequent layers work on a clean base. Layer 2 fills infrastructure gaps (error/loading states). Layer 3 normalizes recurring patterns (buttons, tabs, constants). Layer 4 polishes accessibility. Layer 5 centralizes content strings.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS, Framer Motion, lucide-react

---

## File Map

### New Files
- `src/lib/constants.ts` — UI constants (scroll thresholds, animation intervals)
- `src/app/(public)/error.tsx` — Public route error boundary
- `src/app/(public)/about/loading.tsx` — About page skeleton
- `src/app/(public)/about/ethics/loading.tsx` — Ethics page skeleton
- `src/app/(public)/blog/loading.tsx` — Dispatches page skeleton
- `src/app/(public)/records/loading.tsx` ��� Records page skeleton
- `src/app/(public)/video/loading.tsx` — Video page skeleton
- `src/app/(public)/contact/loading.tsx` — Contact page skeleton
- `src/app/(public)/support/loading.tsx` �� Support page skeleton
- `src/app/(public)/pricing/loading.tsx` ��� Pricing page skeleton
- `src/app/(public)/privacy/loading.tsx` — Privacy page skeleton
- `src/app/(public)/terms/loading.tsx` — Terms page skeleton
- `src/app/(public)/handbooks/[slug]/loading.tsx` — Handbook detail skeleton
- `src/app/(auth)/admin/loading.tsx` — Admin dashboard skeleton

### Modified Files
- `src/styles/globals.css` — Remove dead `.lens-*` classes, add card border docs
- `src/components/content/DownloadCard.tsx` — Replace inline buttons with `.btn-*`
- `src/components/content/CategoryFilterTabs.tsx` — Normalize to `.filter-tab`
- `src/components/content/DownloadCategoryTabs.tsx` — Normalize to `.filter-tab`
- `src/components/layout/Navbar.tsx` — Extract scroll threshold, use SITE_TAGLINE
- `src/components/ui/BackToTop.tsx` — Extract scroll threshold
- `src/components/home/RotatingQuote.tsx` — Extract interval constant
- `src/components/ui/SearchDialog.tsx` — Add spinner, aria-live
- `src/app/(auth)/login/LoginForm.tsx` — Add mode toggle ARIA, form error ARIA
- `src/app/(auth)/signup/SignupForm.tsx` — Add password hint ARIA, submit button
- `src/lib/nav.ts` — Add SOCIAL_LINKS
- `src/lib/seo.ts` — Add SITE_TAGLINE, CONTACT_EMAILS
- `src/components/layout/Footer.tsx` — Import centralized SOCIAL_LINKS + SITE_TAGLINE
- `src/components/layout/MobileMenu.tsx` — Import centralized SOCIAL_LINKS
- `src/app/(public)/contact/page.tsx` — Use centralized email
- `src/app/(public)/privacy/page.tsx` — Use centralized email
- `src/app/(public)/terms/page.tsx` — Use centralized email
- `src/app/(public)/about/ethics/page.tsx` — Use centralized email

---

## Layer 1: Foundation

### Task 1: Remove Dead CSS & Document Existing Patterns

**Files:**
- Modify: `src/styles/globals.css:131-149` (remove lens classes), `src/styles/globals.css:199-234` (add card docs)

- [ ] **Step 1: Remove unused `.lens-*` utility classes from globals.css**

These classes are defined but never referenced in any component (components use `getLensTheme()` from `src/lib/lens-theme.ts` instead).

Remove lines 130-149 in `src/styles/globals.css`:

```css
  /* Lens color classes */
  .lens-health {
    color: var(--bmj-amber);
  }

  .lens-culture {
    color: var(--bmj-tan);
  }

  .lens-politics {
    color: var(--bmj-red);
  }

  .lens-entertainment {
    color: var(--bmj-purple);
  }

  .lens-business {
    color: var(--bmj-olive);
  }
```

- [ ] **Step 2: Add card border hierarchy documentation**

Insert a comment block above the `.card-media` class (line ~199 after removal):

```css
  /*
   * Card border hierarchy — intentional editorial variation.
   *
   * .card-media    — top-heavy border (3px top, 1px sides/bottom): headline content, articles
   * .card-stripe   — left accent (4px left): briefings, dispatches, sidebar items
   * .card-feature  — uniform border (1px all sides): featured content, standalone panels
   * .card-offer    — top-heavy + gradient bg: pricing cards, membership offers
   *
   * Each mimics a different print-era layout convention (broadsheet vs. bulletin vs. poster).
   */
```

- [ ] **Step 3: Verify no breakage**

Run: `npx tsc --noEmit`
Expected: PASS (no type errors — CSS-only change)

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/styles/globals.css
git commit -m "chore: remove unused .lens-* CSS classes, document card border hierarchy"
```

---

## Layer 2: Infrastructure

### Task 2: Add Public Route Error Boundary

**Files:**
- Create: `src/app/(public)/error.tsx`

- [ ] **Step 1: Create the public error boundary**

Match the existing `(auth)/error.tsx` design but with public-appropriate copy.

```tsx
'use client';

import Link from 'next/link';
import { BrandMark } from '@/components/brand/BrandMark';

export default function PublicError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-6 py-24 text-center">
      <BrandMark size={48} color="var(--bmj-red)" className="mb-8 opacity-40" />

      <p className="mb-4 font-mono text-xs uppercase tracking-label-max text-bmj-tan">
        Something Went Wrong
      </p>

      <h1 className="mb-6 font-display text-5xl leading-none text-bmj-white sm:text-7xl">
        PAGE ERROR
      </h1>

      <div className="mx-auto mb-8 h-[3px] w-24 bg-bmj-red" />

      <p className="mx-auto mb-12 max-w-md font-body text-lg leading-relaxed text-bmj-cream/70">
        This page encountered an error. Try again or return to the homepage.
      </p>

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <button
          onClick={reset}
          className="btn-ghost"
        >
          Try Again
        </button>
        <Link href="/" className="btn-secondary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add "src/app/(public)/error.tsx"
git commit -m "feat: add public route error boundary with brand styling"
```

### Task 3: Add Loading States — Content Pages

**Files:**
- Create: `src/app/(public)/about/loading.tsx`
- Create: `src/app/(public)/about/ethics/loading.tsx`
- Create: `src/app/(public)/blog/loading.tsx`
- Create: `src/app/(public)/records/loading.tsx`

- [ ] **Step 1: Create about page loading skeleton**

```tsx
// src/app/(public)/about/loading.tsx
import { Skeleton } from '@/components/ui/Skeleton';

export default function AboutLoading() {
  return (
    <div className="mx-auto max-w-content px-6 py-20" aria-busy="true">
      <div className="mb-12 space-y-4">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <span className="sr-only" role="status">Loading…</span>
    </div>
  );
}
```

- [ ] **Step 2: Create ethics page loading skeleton**

```tsx
// src/app/(public)/about/ethics/loading.tsx
import { Skeleton } from '@/components/ui/Skeleton';

export default function EthicsLoading() {
  return (
    <div className="mx-auto max-w-content px-6 py-20" aria-busy="true">
      <div className="mb-12 space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <span className="sr-only" role="status">Loading…</span>
    </div>
  );
}
```

- [ ] **Step 3: Create dispatches (blog) page loading skeleton**

```tsx
// src/app/(public)/blog/loading.tsx
import { SkeletonCard } from '@/components/ui/Skeleton';

export default function DispatchesLoading() {
  return (
    <div className="mx-auto max-w-content px-6 py-20" aria-busy="true">
      <div className="mb-12 space-y-4">
        <div className="h-12 w-48 animate-pulse bg-bmj-tan/10" />
        <div className="h-4 w-96 max-w-full animate-pulse bg-bmj-tan/10" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <span className="sr-only" role="status">Loading…</span>
    </div>
  );
}
```

- [ ] **Step 4: Create records page loading skeleton**

```tsx
// src/app/(public)/records/loading.tsx
import { Skeleton } from '@/components/ui/Skeleton';

export default function RecordsLoading() {
  return (
    <div className="mx-auto max-w-content px-6 py-20" aria-busy="true">
      <div className="mb-12 space-y-4">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
      <span className="sr-only" role="status">Loading…</span>
    </div>
  );
}
```

- [ ] **Step 5: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add "src/app/(public)/about/loading.tsx" "src/app/(public)/about/ethics/loading.tsx" "src/app/(public)/blog/loading.tsx" "src/app/(public)/records/loading.tsx"
git commit -m "feat: add loading skeletons for about, ethics, blog, and records pages"
```

### Task 4: Add Loading States — Utility Pages

**Files:**
- Create: `src/app/(public)/video/loading.tsx`
- Create: `src/app/(public)/contact/loading.tsx`
- Create: `src/app/(public)/support/loading.tsx`
- Create: `src/app/(public)/pricing/loading.tsx`

- [ ] **Step 1: Create video page loading skeleton**

```tsx
// src/app/(public)/video/loading.tsx
import { Skeleton } from '@/components/ui/Skeleton';

export default function VideoLoading() {
  return (
    <div className="mx-auto max-w-content px-6 py-20" aria-busy="true">
      <div className="mb-12 space-y-4">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-video w-full" />
        ))}
      </div>
      <span className="sr-only" role="status">Loading…</span>
    </div>
  );
}
```

- [ ] **Step 2: Create contact page loading skeleton**

```tsx
// src/app/(public)/contact/loading.tsx
import { Skeleton } from '@/components/ui/Skeleton';

export default function ContactLoading() {
  return (
    <div className="mx-auto max-w-content px-6 py-20" aria-busy="true">
      <div className="mb-12 space-y-4">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="mx-auto max-w-md space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
      <span className="sr-only" role="status">Loading…</span>
    </div>
  );
}
```

- [ ] **Step 3: Create support page loading skeleton**

```tsx
// src/app/(public)/support/loading.tsx
import { Skeleton } from '@/components/ui/Skeleton';

export default function SupportLoading() {
  return (
    <div className="mx-auto max-w-content px-6 py-20" aria-busy="true">
      <div className="mb-12 space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
      </div>
      <span className="sr-only" role="status">Loading…</span>
    </div>
  );
}
```

- [ ] **Step 4: Create pricing page loading skeleton**

```tsx
// src/app/(public)/pricing/loading.tsx
import { Skeleton } from '@/components/ui/Skeleton';

export default function PricingLoading() {
  return (
    <div className="mx-auto max-w-content px-6 py-20" aria-busy="true">
      <div className="mb-12 space-y-4 text-center">
        <Skeleton className="mx-auto h-12 w-48" />
        <Skeleton className="mx-auto h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-80 w-full" />
        ))}
      </div>
      <span className="sr-only" role="status">Loading��</span>
    </div>
  );
}
```

- [ ] **Step 5: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add "src/app/(public)/video/loading.tsx" "src/app/(public)/contact/loading.tsx" "src/app/(public)/support/loading.tsx" "src/app/(public)/pricing/loading.tsx"
git commit -m "feat: add loading skeletons for video, contact, support, and pricing pages"
```

### Task 5: Add Loading States — Legal Pages, Handbook Detail & Admin

**Files:**
- Create: `src/app/(public)/privacy/loading.tsx`
- Create: `src/app/(public)/terms/loading.tsx`
- Create: `src/app/(public)/handbooks/[slug]/loading.tsx`
- Create: `src/app/(auth)/admin/loading.tsx`

- [ ] **Step 1: Create privacy page loading skeleton**

```tsx
// src/app/(public)/privacy/loading.tsx
import { Skeleton } from '@/components/ui/Skeleton';

export default function PrivacyLoading() {
  return (
    <div className="mx-auto max-w-article px-6 py-20" aria-busy="true">
      <div className="mb-12 space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      <span className="sr-only" role="status">Loading…</span>
    </div>
  );
}
```

- [ ] **Step 2: Create terms page loading skeleton**

```tsx
// src/app/(public)/terms/loading.tsx
import { Skeleton } from '@/components/ui/Skeleton';

export default function TermsLoading() {
  return (
    <div className="mx-auto max-w-article px-6 py-20" aria-busy="true">
      <div className="mb-12 space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      <span className="sr-only" role="status">Loading…</span>
    </div>
  );
}
```

- [ ] **Step 3: Create handbook detail loading skeleton**

```tsx
// src/app/(public)/handbooks/[slug]/loading.tsx
import { Skeleton } from '@/components/ui/Skeleton';

export default function HandbookDetailLoading() {
  return (
    <div className="mx-auto max-w-article px-6 py-20" aria-busy="true">
      <Skeleton className="mb-4 h-3 w-48" />
      <Skeleton className="mb-6 h-12 w-3/4" />
      <Skeleton className="mb-8 h-64 w-full" />
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      <span className="sr-only" role="status">Loading…</span>
    </div>
  );
}
```

- [ ] **Step 4: Create admin dashboard loading skeleton**

```tsx
// src/app/(auth)/admin/loading.tsx
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminLoading() {
  return (
    <div className="space-y-8 p-8" aria-busy="true">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
      <span className="sr-only" role="status">Loading…</span>
    </div>
  );
}
```

- [ ] **Step 5: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add "src/app/(public)/privacy/loading.tsx" "src/app/(public)/terms/loading.tsx" "src/app/(public)/handbooks/[slug]/loading.tsx" "src/app/(auth)/admin/loading.tsx"
git commit -m "feat: add loading skeletons for legal pages, handbook detail, and admin dashboard"
```

---

## Layer 3: Standardization

### Task 6: Create Constants File & Extract Magic Numbers

**Files:**
- Create: `src/lib/constants.ts`
- Modify: `src/components/layout/Navbar.tsx:30`
- Modify: `src/components/ui/BackToTop.tsx:11`
- Modify: `src/components/home/RotatingQuote.tsx:45`

- [ ] **Step 1: Create the constants file**

```typescript
// src/lib/constants.ts

/** Scroll distance (px) before the navbar applies its blur/bg effect. */
export const SCROLL_THRESHOLD_NAV = 20;

/** Scroll distance (px) before the "back to top" button appears. */
export const SCROLL_THRESHOLD_BACK_TO_TOP = 400;

/** Interval (ms) between slides in the featured article carousel. */
export const CAROUSEL_INTERVAL_MS = 6000;

/** Interval (ms) between quote rotations on the homepage. */
export const QUOTE_ROTATION_INTERVAL_MS = 8000;
```

- [ ] **Step 2: Update Navbar.tsx to use SCROLL_THRESHOLD_NAV**

In `src/components/layout/Navbar.tsx`, add the import:
```typescript
import { SCROLL_THRESHOLD_NAV } from '@/lib/constants';
```

Replace line 30:
```typescript
// Before:
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
// After:
    const handleScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD_NAV);
```

- [ ] **Step 3: Update BackToTop.tsx to use SCROLL_THRESHOLD_BACK_TO_TOP**

In `src/components/ui/BackToTop.tsx`, add the import:
```typescript
import { SCROLL_THRESHOLD_BACK_TO_TOP } from '@/lib/constants';
```

Replace line 11:
```typescript
// Before:
      setVisible(window.scrollY > 400);
// After:
      setVisible(window.scrollY > SCROLL_THRESHOLD_BACK_TO_TOP);
```

- [ ] **Step 4: Update RotatingQuote.tsx to use QUOTE_ROTATION_INTERVAL_MS**

In `src/components/home/RotatingQuote.tsx`, add the import:
```typescript
import { QUOTE_ROTATION_INTERVAL_MS } from '@/lib/constants';
```

Replace line 45:
```typescript
// Before:
    }, 8000);
// After:
    }, QUOTE_ROTATION_INTERVAL_MS);
```

- [ ] **Step 5: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 6: Run tests**

Run: `npm test -- --passWithNoTests`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/constants.ts src/components/layout/Navbar.tsx src/components/ui/BackToTop.tsx src/components/home/RotatingQuote.tsx
git commit -m "refactor: extract UI magic numbers to src/lib/constants.ts"
```

### Task 7: Standardize DownloadCard Buttons

**Files:**
- Modify: `src/components/content/DownloadCard.tsx:58-75`

- [ ] **Step 1: Replace inline button styles with .btn-* classes**

In `src/components/content/DownloadCard.tsx`, replace the download link (lines 58-65):

```tsx
// Before:
          <a
            href={`/api/downloads/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-bmj-red px-4 py-2 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
          >
            <Download size={14} />
            Download
          </a>
// After:
          <a
            href={`/api/downloads/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary btn-sm inline-flex items-center gap-2"
          >
            <Download size={14} />
            Download
          </a>
```

Replace the upgrade link (lines 68-74):

```tsx
// Before:
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 border border-bmj-red/40 px-4 py-2 font-label text-xs uppercase tracking-widest text-bmj-red no-underline transition-colors hover:bg-bmj-red/10"
          >
            <Lock size={14} />
            Upgrade
          </Link>
// After:
          <Link
            href="/pricing"
            className="btn-secondary btn-sm inline-flex items-center gap-2"
          >
            <Lock size={14} />
            Upgrade
          </Link>
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/content/DownloadCard.tsx
git commit -m "refactor: replace inline button styles with .btn-* classes in DownloadCard"
```

### Task 8: Normalize Filter Tabs

**Files:**
- Modify: `src/components/content/CategoryFilterTabs.tsx:47-52`
- Modify: `src/components/content/DownloadCategoryTabs.tsx:47-52`

- [ ] **Step 1: Normalize CategoryFilterTabs.tsx**

Replace the className array (lines 47-52):

```tsx
// Before:
            className={[
              'whitespace-nowrap pb-3 font-label text-sm uppercase tracking-widest transition-colors',
              isActive
                ? 'border-b-2 border-bmj-red text-bmj-white'
                : 'text-bmj-tan hover:text-bmj-cream',
            ].join(' ')}
// After:
            className={[
              'filter-tab whitespace-nowrap',
              isActive
                ? 'border-b-2 border-bmj-red text-bmj-white'
                : 'filter-tab-inactive',
            ].join(' ')}
```

- [ ] **Step 2: Normalize DownloadCategoryTabs.tsx**

Apply the same change to `src/components/content/DownloadCategoryTabs.tsx` (lines 47-52):

```tsx
// Before:
            className={[
              'whitespace-nowrap pb-3 font-label text-sm uppercase tracking-widest transition-colors',
              isActive
                ? 'border-b-2 border-bmj-red text-bmj-white'
                : 'text-bmj-tan hover:text-bmj-cream',
            ].join(' ')}
// After:
            className={[
              'filter-tab whitespace-nowrap',
              isActive
                ? 'border-b-2 border-bmj-red text-bmj-white'
                : 'filter-tab-inactive',
            ].join(' ')}
```

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/content/CategoryFilterTabs.tsx src/components/content/DownloadCategoryTabs.tsx
git commit -m "refactor: normalize filter tabs to use .filter-tab component classes"
```

---

## Layer 4: UX Polish

### Task 9: Improve Search Dialog UX

**Files:**
- Modify: `src/components/ui/SearchDialog.tsx:128-136`

- [ ] **Step 1: Add CSS spinner and aria-live to SearchDialog**

In `src/components/ui/SearchDialog.tsx`, replace the results container (line 128 onwards):

```tsx
// Before:
        <div className="max-h-[50vh] overflow-y-auto overscroll-contain">
          {loading && (
            <p className="px-6 py-4 font-mono text-xs text-bmj-tan" role="status">Searching…</p>
          )}
          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <p className="px-6 py-8 text-center font-body text-sm text-bmj-tan">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}
// After:
        <div className="max-h-[50vh] overflow-y-auto overscroll-contain" aria-live="polite">
          {loading && (
            <p className="flex items-center gap-2 px-6 py-4 font-mono text-xs text-bmj-tan" role="status">
              <span className="inline-block h-3 w-3 animate-spin border border-bmj-tan/60 border-t-bmj-red" />
              Searching…
            </p>
          )}
          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <p className="px-6 py-8 text-center font-body text-sm text-bmj-tan" role="status">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/SearchDialog.tsx
git commit -m "fix: add loading spinner and aria-live region to SearchDialog"
```

### Task 10: Add Accessibility to Login Form

**Files:**
- Modify: `src/app/(auth)/login/LoginForm.tsx`

- [ ] **Step 1: Add ARIA attributes to mode toggle and submit buttons**

In `src/app/(auth)/login/LoginForm.tsx`, update the mode toggle buttons (lines 18-41) to add `role="tablist"` and `role="tab"`:

```tsx
// Before:
      <div className="mb-6 flex gap-4 border-b border-bmj-tan/20 pb-4">
        <button
          type="button"
          onClick={() => setMode('password')}
          className={`font-label text-xs uppercase tracking-widest transition-colors ${
            mode === 'password'
              ? 'text-bmj-white'
              : 'text-bmj-tan hover:text-bmj-cream'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode('magic')}
          className={`font-label text-xs uppercase tracking-widest transition-colors ${
            mode === 'magic'
              ? 'text-bmj-white'
              : 'text-bmj-tan hover:text-bmj-cream'
          }`}
        >
          Magic Link
        </button>
      </div>
// After:
      <div className="mb-6 flex gap-4 border-b border-bmj-tan/20 pb-4" role="tablist" aria-label="Login method">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'password'}
          onClick={() => setMode('password')}
          className={`font-label text-xs uppercase tracking-widest transition-colors ${
            mode === 'password'
              ? 'text-bmj-white'
              : 'text-bmj-tan hover:text-bmj-cream'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'magic'}
          onClick={() => setMode('magic')}
          className={`font-label text-xs uppercase tracking-widest transition-colors ${
            mode === 'magic'
              ? 'text-bmj-white'
              : 'text-bmj-tan hover:text-bmj-cream'
          }`}
        >
          Magic Link
        </button>
      </div>
```

Also update both submit buttons to use `.btn-primary`:

```tsx
// Before (line 83-87 — password form):
          <button
            type="submit"
            className="w-full bg-bmj-red py-3 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
          >
            Log In
          </button>
// After:
          <button type="submit" className="btn-primary w-full py-3 text-sm">
            Log In
          </button>
```

```tsx
// Before (line 112-116 — magic link form):
          <button
            type="submit"
            className="w-full bg-bmj-red py-3 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
          >
            Send Magic Link
          </button>
// After:
          <button type="submit" className="btn-primary w-full py-3 text-sm">
            Send Magic Link
          </button>
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add "src/app/(auth)/login/LoginForm.tsx"
git commit -m "fix: add ARIA tablist to login mode toggle, standardize submit buttons"
```

### Task 11: Add Accessibility to Signup Form

**Files:**
- Modify: `src/app/(auth)/signup/SignupForm.tsx`

- [ ] **Step 1: Add password hint and standardize submit button**

In `src/app/(auth)/signup/SignupForm.tsx`, add `aria-describedby` to the password field and standardize the submit button:

```tsx
// Before (password field, lines 72-82):
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/70 focus:border-bmj-red focus:outline-none"
              placeholder="Create a password"
            />
// After:
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              aria-describedby="password-hint"
              className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/70 focus:border-bmj-red focus:outline-none"
              placeholder="Create a password"
            />
            <p id="password-hint" className="mt-1 font-mono text-xs text-bmj-tan/60">
              Minimum 6 characters
            </p>
```

```tsx
// Before (submit button, lines 95-99):
          <button
            type="submit"
            className="w-full bg-bmj-red py-3 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
          >
            Create Account
          </button>
// After:
          <button type="submit" className="btn-primary w-full py-3 text-sm">
            Create Account
          </button>
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add "src/app/(auth)/signup/SignupForm.tsx"
git commit -m "fix: add password hint aria-describedby and standardize signup submit button"
```

---

## Layer 5: Content Fixes

### Task 12: Centralize Social Links

**Files:**
- Modify: `src/lib/nav.ts`
- Modify: `src/components/layout/Footer.tsx:8-13`
- Modify: `src/components/layout/MobileMenu.tsx:5,16-21`

- [ ] **Step 1: Add SOCIAL_LINKS to nav.ts**

Append to `src/lib/nav.ts`:

```typescript
import { Instagram, Youtube, Linkedin, Twitter, type LucideIcon } from 'lucide-react';

export type SocialLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

/**
 * Social media links — shared between Footer, MobileMenu, and anywhere else.
 * Update hrefs here when real accounts are created.
 */
export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Instagram', href: '#', icon: Instagram },
  { label: 'YouTube', href: '#', icon: Youtube },
  { label: 'LinkedIn', href: '#', icon: Linkedin },
  { label: 'Twitter / X', href: '#', icon: Twitter },
];
```

- [ ] **Step 2: Update Footer.tsx to import from nav.ts**

In `src/components/layout/Footer.tsx`:

Remove the local `SOCIAL_LINKS` array (lines 8-13) and the individual icon imports.

Update imports:
```typescript
// Before:
import { Instagram, Youtube, Linkedin, Twitter } from "lucide-react";
import { FOOTER_NAV_LINKS } from '@/lib/nav';

const SOCIAL_LINKS = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube,   href: "#", label: "YouTube" },
  { icon: Linkedin,  href: "#", label: "LinkedIn" },
  { icon: Twitter,   href: "#", label: "Twitter / X" },
];
// After:
import { FOOTER_NAV_LINKS, SOCIAL_LINKS } from '@/lib/nav';
```

Update the social icon render (line 108) — the `icon` prop is now lowercase:
```tsx
// Before:
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
// After:  (same — destructuring still works, no change needed)
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
```

- [ ] **Step 3: Update MobileMenu.tsx to import from nav.ts**

In `src/components/layout/MobileMenu.tsx`:

Remove the local `SOCIAL_LINKS` array (lines 16-21) and the individual icon imports.

Update imports:
```typescript
// Before:
import { X, Instagram, Youtube, Linkedin, Twitter } from 'lucide-react';
...
const SOCIAL_LINKS = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Twitter, href: '#', label: 'Twitter / X' },
];
// After:
import { X } from 'lucide-react';
import { HEADER_NAV_LINKS, SOCIAL_LINKS } from '@/lib/nav';
```

Note: `HEADER_NAV_LINKS` is already imported — just add `SOCIAL_LINKS` to the existing import.

- [ ] **Step 4: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/nav.ts src/components/layout/Footer.tsx src/components/layout/MobileMenu.tsx
git commit -m "refactor: centralize SOCIAL_LINKS in nav.ts, remove duplicates from Footer and MobileMenu"
```

### Task 13: Centralize Email Addresses & Tagline

**Files:**
- Modify: `src/lib/seo.ts`
- Modify: `src/components/layout/Navbar.tsx:68`
- Modify: `src/components/layout/Footer.tsx:36`
- Modify: `src/app/(public)/contact/page.tsx:75,78`
- Modify: `src/app/(public)/privacy/page.tsx:202,205`
- Modify: `src/app/(public)/terms/page.tsx:188,191`
- Modify: `src/app/(public)/about/ethics/page.tsx:82`

- [ ] **Step 1: Add constants to seo.ts**

Append to `src/lib/seo.ts` after the existing constants (after line 10):

```typescript
export const SITE_TAGLINE = 'Speak the Truth. Navigate the Consequences.';

export const CONTACT_EMAILS = {
  general: 'chairman@blackmalejournal.com',
  privacy: 'privacy@blackmalejournal.com',
  support: 'contact@blackmalejournal.com',
} as const;
```

- [ ] **Step 2: Update Navbar.tsx to use SITE_TAGLINE**

In `src/components/layout/Navbar.tsx`, add the import:
```typescript
import { SITE_TAGLINE } from '@/lib/seo';
```

Replace line 68:
```tsx
// Before:
                Speak the Truth. Navigate the Consequences.
// After:
                {SITE_TAGLINE}
```

- [ ] **Step 3: Update Footer.tsx to use SITE_TAGLINE**

In `src/components/layout/Footer.tsx`, add the import:
```typescript
import { SITE_TAGLINE } from '@/lib/seo';
```

Replace line 36:
```tsx
// Before:
                  Speak the Truth. Navigate the Consequences.
// After:
                  {SITE_TAGLINE}
```

- [ ] **Step 4: Update contact page to use CONTACT_EMAILS**

In `src/app/(public)/contact/page.tsx`, add the import:
```typescript
import { CONTACT_EMAILS } from '@/lib/seo';
```

Replace the hardcoded email (lines 75, 78):
```tsx
// Before:
                  href="mailto:chairman@blackmalejournal.com"
                  ...
                  chairman@blackmalejournal.com
// After:
                  href={`mailto:${CONTACT_EMAILS.general}`}
                  ...
                  {CONTACT_EMAILS.general}
```

- [ ] **Step 5: Update privacy page to use CONTACT_EMAILS**

In `src/app/(public)/privacy/page.tsx`, add the import:
```typescript
import { CONTACT_EMAILS } from '@/lib/seo';
```

Replace the hardcoded email (lines 202, 205):
```tsx
// Before:
            href="mailto:privacy@blackmalejournal.com"
            ...
            privacy@blackmalejournal.com
// After:
            href={`mailto:${CONTACT_EMAILS.privacy}`}
            ...
            {CONTACT_EMAILS.privacy}
```

- [ ] **Step 6: Update terms page to use CONTACT_EMAILS**

In `src/app/(public)/terms/page.tsx`, add the import:
```typescript
import { CONTACT_EMAILS } from '@/lib/seo';
```

Replace the hardcoded email (lines 188, 191):
```tsx
// Before:
            href="mailto:contact@blackmalejournal.com"
            ...
            contact@blackmalejournal.com
// After:
            href={`mailto:${CONTACT_EMAILS.support}`}
            ...
            {CONTACT_EMAILS.support}
```

- [ ] **Step 7: Update ethics page to use CONTACT_EMAILS**

In `src/app/(public)/about/ethics/page.tsx`, add the import:
```typescript
import { CONTACT_EMAILS } from '@/lib/seo';
```

Replace the hardcoded email (line 82):
```tsx
// Before:
          Chairman directly at chairman@blackmalejournal.com. All credible
// After:
          Chairman directly at {CONTACT_EMAILS.general}. All credible
```

- [ ] **Step 8: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 9: Run tests**

Run: `npm test -- --passWithNoTests`
Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add src/lib/seo.ts src/components/layout/Navbar.tsx src/components/layout/Footer.tsx "src/app/(public)/contact/page.tsx" "src/app/(public)/privacy/page.tsx" "src/app/(public)/terms/page.tsx" "src/app/(public)/about/ethics/page.tsx"
git commit -m "refactor: centralize SITE_TAGLINE and CONTACT_EMAILS in seo.ts"
```

---

## Final Verification

### Task 14: Full Build & Test Verification

- [ ] **Step 1: Run full TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS (zero errors)

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 3: Run full test suite**

Run: `npm test`
Expected: Full Jest suite passes (see root `README.md` for current suite and test counts)

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: PASS (all pages build successfully)

- [ ] **Step 5: If any failures, fix and re-run**

Address any test failures caused by changed class names or restructured imports.
Re-run: `npm test` and `npm run build`
Expected: PASS
