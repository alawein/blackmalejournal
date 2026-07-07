---
name: bmj-content-page
description: Use when building a new public-facing content page — listing pages with filters, detail pages with SEO, breadcrumbs, access gating. Triggers on "new page", "content listing", "detail page", "add route".
---

# BMJ Content Page Builder

How to build public content pages following established patterns.

## Doc context (Tier A/B)

[AGENTS.md](../../AGENTS.md), [CLAUDE.md](../../CLAUDE.md), [docs/standards/agent-knowledge-protocol.md](../../docs/standards/agent-knowledge-protocol.md). **Task-scoped:** [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md); CLAUDE.md (Route Rename Checklist); `src/lib/seo.ts` for metadata helpers.

## Listing Page Pattern

Location: `src/app/(public)/<content-type>/page.tsx`

```tsx
import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { StarDivider } from '@/components/ui/StarDivider';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { EmptyState } from '@/components/ui/EmptyState';
// Import query function from src/lib/supabase/queries.ts
// Import card component from src/components/content/

export const revalidate = 60; // ISR: revalidate every 60s

export const metadata: Metadata = {
  title: 'Page Title',
  description: '...',
  openGraph: { title: '...', description: '...' },
  twitter: { card: 'summary_large_image', title: '...', description: '...' },
};

export default async function ListingPage() {
  const items = await getItems();
  return (
    <div className="page-shell py-16">
      <PageHeader label="Category" title="PAGE TITLE" description="..." />
      <ScrollReveal as="div" delay={0.1}>
        {items.length === 0 ? (
          <EmptyState message="No items yet." />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => <Card key={item.id} item={item} />)}
          </div>
        )}
      </ScrollReveal>
    </div>
  );
}
```

**Also create:** `loading.tsx` with `<Skeleton>` components in the same directory.

## Detail Page Pattern

Location: `src/app/(public)/<content-type>/[slug]/page.tsx`

Required elements:
1. `generateMetadata()` — dynamic OG/Twitter metadata from content
2. `<JsonLd>` — structured data via `articleJsonLd()` from `src/lib/seo.ts`
3. `<Breadcrumbs>` — navigation context
4. `<ScrollReveal>` — wrap header, body, and related content sections
5. Access gating via `checkContentAccess()` + `<PaywallGate>`

```tsx
const { hasAccess, user } = await checkContentAccess(item.access_tier);
// If hasAccess: render full content
// If !hasAccess: render PaywallGate with preview
```

## SEO Checklist

| Element | Source |
|---------|--------|
| `<title>` | From content title |
| `og:title`, `og:description` | From content title + excerpt |
| `og:image` | From content cover_image |
| `twitter:card` | `summary_large_image` |
| JSON-LD | `articleJsonLd()` or `breadcrumbJsonLd()` from `src/lib/seo.ts` |
| Sitemap | Add URL to `src/app/sitemap.ts` |

## Route Rename Checklist

When renaming a route, update all 5 locations (see CLAUDE.md "Route Rename Checklist").

## Lens Theming

Content with a `lens` field should use `getLensTheme(lens)` from `src/lib/lens-theme.ts` for accent colors. Never hardcode lens colors.
