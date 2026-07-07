---
title: BMJ Image Asset Organization
authority: canonical
status: active
audience: [designers, engineers]
last-updated: 2026-04-08
---

# BMJ Image Asset Organization

---

## Table of Contents

1. [Overview](#overview)
2. [Asset Inventory](#asset-inventory)
3. [Directory Structure](#directory-structure)
4. [Naming Conventions](#naming-conventions)
5. [Asset Categories](#asset-categories)
6. [Usage Guidelines](#usage-guidelines)
7. [Optimization Standards](#optimization-standards)
8. [Implementation Reference](#implementation-reference)
9. [Maintenance Checklist](#maintenance-checklist)

---

## Overview

All image assets for BMJ follow a strict organizational system to ensure consistency, performance, and maintainability. Assets are organized by function and usage context.

### Key Principles

1. **Single Source of Truth** — Each asset serves one primary purpose
2. **Consistent Naming** — All files follow `{type}-{variant}.{ext}` pattern
3. **Format Optimization** — SVG for vectors/icons, PNG for complex images with transparency
4. **Performance First** — All assets are optimized for web delivery
5. **Accessibility** — All images have defined alt text strategies

---

## Asset Inventory

### Complete Asset List (as of 2026-04-08)

| File | Type | Size | Category | Usage |
|------|------|------|----------|-------|
| **Logos** | | | | |
| `/logos/primary-color.svg` | SVG | Vector | Brand Identity | Website header, full brand display |
| `/logos/primary-color.png` | PNG | 280x80 | Brand Identity | JSON-LD schema, fallback |
| `/logos/primary-light.png` | PNG | 280x80 | Brand Identity | Apple touch icon, light backgrounds |
| `/logos/submark-color.svg` | SVG | Vector | Brand Identity | Compact horizontal logo |
| `/logos/monogram-color.svg` | SVG | Vector | Brand Identity | BMJ monogram, social avatars |
| `/logos/b-mark.svg` | SVG | Vector | Brand Identity | Compact B mark, small applications |
| `/logos/wordmark-light.svg` | SVG | Vector | Brand Identity | Full name, dark backgrounds |
| `/logos/wordmark-dark.svg` | SVG | Vector | Brand Identity | Full name, light backgrounds |
| `/logos/favicon-red.svg` | SVG | Vector | Brand Identity | Alternative favicon |
| **Root Assets** | | | | |
| `/favicon.svg` | SVG | Vector | System | Browser favicon |
| `/og-image.svg` | SVG | 1200x630 | Social | Default OpenGraph image |
| **Placeholders** | | | | |
| `/placeholders/article.svg` | SVG | 16:9 | Content | Article cards fallback |
| `/placeholders/briefing.svg` | SVG | 16:9 | Content | Briefing cards fallback |
| `/placeholders/course.svg` | SVG | 16:9 | Content | Course cards fallback |
| `/placeholders/handbook.svg` | SVG | 16:9 | Content | Handbook cards fallback |
| `/placeholders/dispatch.svg` | SVG | 16:9 | Content | Dispatch cards fallback |
| `/placeholders/download.svg` | SVG | 16:9 | Content | Download cards fallback |
| `/placeholders/cover.svg` | SVG | 16:9 | Content | Generic fallback |
| **Textures** | | | | |
| `/textures/grain.svg` | SVG | Tile | Visual Effect | Film grain overlay |
| **Documentation** | | | | |
| `/docs/brand/bmj-palettes.png` | PNG | Reference | Internal | Color palette reference |
| `/docs/brand/bmj-palettes-reference.png` | PNG | Reference | Internal | Extended palette reference |

---

## Directory Structure

```
public/
├── favicon.svg              # Site favicon (root for browser compatibility)
├── og-image.svg             # Default OpenGraph image
│
├── logos/                   # Brand identity assets
│   ├── primary-color.svg    # Full logo, color version
│   ├── primary-color.png    # Full logo, PNG fallback
│   ├── primary-light.png    # Full logo, light version
│   ├── submark-color.svg    # Compact horizontal mark
│   ├── monogram-color.svg   # BMJ letters mark
│   ├── b-mark.svg           # Single B mark
│   ├── wordmark-light.svg   # Text logo for dark backgrounds
│   ├── wordmark-dark.svg    # Text logo for light backgrounds
│   └── favicon-red.svg      # Alternative red favicon
│
├── placeholders/            # Content-type placeholder images
│   ├── article.svg          # Article cards
│   ├── briefing.svg         # Briefing/magazine covers
│   ├── course.svg           # Academy courses
│   ├── handbook.svg         # Handbook content
│   ├── dispatch.svg         # Dispatch newsletter
│   └── download.svg         # Downloadable resources
│   └── cover.svg            # Generic cover fallback
│
└── textures/                # Visual effect assets
    └── grain.svg            # Film grain texture
```

---

## Naming Conventions

### Logo Files

```
{type}-{variant}.{ext}

Types:
- primary     Full logo with icon
- submark     Compact/abbreviated mark
- monogram    Letter-based mark (BMJ)
- b-mark      Single letter mark
- wordmark    Text-only logo
- favicon     Browser icon variant

Variants:
- color       Full color on transparent
- light       For dark backgrounds (light fill)
- dark        For light backgrounds (dark fill)

Extensions:
- .svg        Vector (preferred)
- .png        Raster fallback
```

### Placeholder Files

```
/placeholders/{content-type}.svg

Content Types (from PLACEHOLDERS constant):
- article
- briefing
- course
- handbook
- dispatch
- download
- cover (generic)
```

### Texture Files

```
/textures/{effect-name}.svg

Effects:
- grain       Film grain overlay
```

---

## Asset Categories

### 1. Brand Identity Assets (`/logos/`)

**Purpose:** Official brand representation across all touchpoints.

| Asset | Primary Use | Minimum Size | Background |
|-------|-------------|--------------|------------|
| primary-color.svg | Website header, hero sections | 120px wide | Dark (bmj-black) |
| primary-color.png | JSON-LD, email, legacy | 280px wide | Any |
| primary-light.png | Apple touch icon | 180x180px | Dark |
| submark-color.svg | Email signatures, compact | 80px wide | Any |
| monogram-color.svg | Social avatars, icons | 32px | Any |
| b-mark.svg | Favicon, small icons | 16px | Any |
| wordmark-light.svg | Print, overlays | 160px wide | Dark |
| wordmark-dark.svg | Print on cream | 160px wide | Light (cream/paper) |
| favicon-red.svg | Browser tabs | 16-32px | Tab UI |

### 2. Social/SEO Assets (`/og-image.svg`, `/favicon.svg`)

**Purpose:** Browser identification and social media sharing.

| Asset | Dimensions | Platform |
|-------|------------|----------|
| og-image.svg | 1200x630 | OpenGraph, Twitter cards |
| favicon.svg | 32x32 (viewBox) | All browsers |

### 3. Content Placeholders (`/placeholders/`)

**Purpose:** Fallback images when content has no cover image.

All placeholders follow BMJ brand identity with:
- 16:9 aspect ratio
- Brand colors (bmj-black background, bmj-red/cream accents)
- Content-type iconography
- Grain texture applied

### 4. Visual Effects (`/textures/`)

**Purpose:** Overlay textures for brand consistency.

| Texture | Application | CSS Usage |
|---------|-------------|-----------|
| grain.svg | Full-page overlay | `background-image: url('/textures/grain.svg')` |

---

## Usage Guidelines

### In React/Next.js Components

```tsx
// Using next/image for optimized delivery
import Image from 'next/image';

// Logo usage
<Image
  src="/logos/primary-color.svg"
  alt="The Black Male Journal"
  width={280}
  height={80}
  priority // For above-fold content
/>

// Placeholder usage (via centralized constants)
import { PLACEHOLDERS } from '@/lib/placeholders';

<Image
  src={coverImage || PLACEHOLDERS.article}
  alt={title}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, 33vw"
/>
```

### In CSS/Tailwind

```css
/* Grain texture overlay */
.grain {
  position: relative;
}
.grain::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/textures/grain.svg');
  opacity: 0.08;
  pointer-events: none;
}
```

### In Metadata/SEO

```tsx
// src/app/layout.tsx
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logos/favicon-red.svg", type: "image/svg+xml" },
    ],
    apple: "/logos/primary-light.png",
  },
  openGraph: {
    images: [{ url: "/og-image.svg", width: 1200, height: 630 }],
  },
};
```

### In JSON-LD Schema

```tsx
// src/lib/seo.ts
logo: siteAbsoluteUrl('/logos/primary-color.png'),
```

---

## Optimization Standards

### SVG Optimization

All SVGs should be optimized with:
- Removed metadata and comments
- Minified paths
- Appropriate viewBox (no fixed width/height unless needed)
- Accessible title/desc where appropriate

### PNG Optimization

- Maximum quality: 85% (for JPEGs if used)
- Color profile: sRGB
- Metadata stripped
- Progressive loading enabled

### Caching Headers

From `next.config.ts`:

```typescript
{
  source: '/logos/:path*',
  headers: [
    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
  ],
},
{
  source: '/textures/:path*',
  headers: [
    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
  ],
},
```

### Responsive Images

Use Next.js Image `sizes` prop for responsive delivery:

```tsx
// Full-width hero
sizes="100vw"

// Card grid (3-col desktop)
sizes="(max-width: 768px) 100vw, 33vw"

// Sidebar image
sizes="(max-width: 768px) 100vw, 300px"
```

---

## Implementation Reference

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/placeholders.ts` | Centralized placeholder paths |
| `src/lib/seo.ts` | Logo paths for JSON-LD |
| `src/app/layout.tsx` | Favicon and OG image metadata |
| `next.config.ts` | Image caching headers |
| `src/components/brand/BrandMark.tsx` | Inline SVG brand mark |

### Code References

```typescript
// src/lib/placeholders.ts
export const PLACEHOLDERS = {
  cover: '/placeholders/cover.svg',
  article: '/placeholders/article.svg',
  briefing: '/placeholders/briefing.svg',
  course: '/placeholders/course.svg',
  handbook: '/placeholders/handbook.svg',
  dispatch: '/placeholders/dispatch.svg',
  download: '/placeholders/download.svg',
} as const;
```

---

## Maintenance Checklist

### When Adding New Assets

- [ ] Follow naming convention: `{type}-{variant}.{ext}`
- [ ] Place in appropriate directory
- [ ] Optimize before committing (SVGO for SVGs)
- [ ] Update this inventory document
- [ ] Add to `PLACEHOLDERS` if content-type placeholder
- [ ] Add caching header in `next.config.ts` if new directory
- [ ] Update `VISUAL-SSOT.md` if brand asset

### When Modifying Assets

- [ ] Maintain same filename unless purposeful rename
- [ ] Update all code references if renamed
- [ ] Test all usage contexts
- [ ] Clear CDN cache if applicable

### Periodic Review

- [ ] Audit unused assets quarterly
- [ ] Verify all code references are valid
- [ ] Check optimization levels
- [ ] Validate accessibility (alt texts)

---

## Related Documentation

- [VISUAL-SSOT.md](VISUAL-SSOT.md) — Visual identity index
- [BMJ-BRAND-REDESIGN-STRATEGY.md](BMJ-BRAND-REDESIGN-STRATEGY.md) — Brand strategy
- [invariants.md](invariants.md) — Design rules
- [art-direction-spec.md](art-direction-spec.md) — Art direction principles
