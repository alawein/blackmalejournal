---
title: BMJ visual invariants
authority: canonical
status: canonical
audience: [designers, engineers, agents]
last-verified: 2026-04-09
---

# BMJ Visual Invariants

**Asset index and embedded previews:** [visual-ssot.md](visual-ssot.md) (normative doc SSOT).

Implementation law for The Black Male Journal's visual system.
These rules apply to all components, pages, and future contributors.
When in doubt, default to the militant print culture spec in docs/brand/art-direction-spec.md.

---

## Non-Negotiables (never override)

### Color
- **Core palette only:** `#0D0C0B` (black), `#E8DCC8` (cream), `#F2EDE4` (white), `#C0281F` (red)
- **Secondaries (use sparingly):** `#C8852A` (amber), `#3B2417` (brown), `#B8986A` (tan)
- **Sectional accents (use only when tied to a specific content domain):**
  - `#F0DDBC` (paper) — lighter paper ground for card backgrounds
  - `#1C130E` (deep-black) — heavier typographic weight
  - `#712414` (crimson) — politics accent
  - `#5D3F2E` (medium-brown) — culture/editorial accent
  - `#416100` (olive) — health/wellness accent
  - `#C77A0E` (gold) — finance/business accent
  - `#554978` (purple) — technology accent (**deferred until taxonomy expansion**)
- **PROHIBITED:** pastels, gradients, blue, neon, any color not in the brand.css palette
- Red is for urgency and command — accents, CTAs, active states, section breaks

### Typography
- **Highrise** for ALL display/headline text — always uppercase, always `font-display` (self-hosted, DEMO license — needs commercial purchase)
- **Libre Baskerville** for body copy — `font-body`, never used for headlines (Google Fonts, SIL OFL — free)
- **Oswald** for labels, buttons, metadata labels — `font-label`, uppercase, tracked wide (Google Fonts)
- **IBM Plex Mono** for dates, issue numbers, publication identifiers — `font-mono` (Google Fonts)
- Font files and license status: `public/fonts/LICENSES.md`
- No system fonts, no unauthorized font stacks with fallbacks as primary typefaces

### Logo System
- **Primary logo:** Wordmark with journal/book icon — used in OG images, about page, print
- **Alternate logo:** Compact alternate wordmark — used for social media, compact spaces
- **Submark:** Book icon only (star + pen nib) — used for watermarks, small marks
- **Favicon:** Star + pen nib — derived from submark, simplified for 16x16/32x32
- **BrandMark component** (`src/components/brand/BrandMark.tsx`) is the canonical inline SVG — use it instead of inline SVG paths in components
- Logo files: `public/logos/` (PNG + SVG for each variant: color, dark, light), `public/favicon.svg`, `public/logo.svg`
- Naming convention: `{type}-{variant}.{ext}` — e.g., `primary-color.svg`, `submark-dark.png`, `favicon-red.svg`
- **Tagline:** "Study Well. Speak the Truth. Navigate the Consequences." — displayed in Navbar (desktop) and Footer

### Surfaces & Effects
- **NO drop shadows** — `shadow-*` Tailwind classes are prohibited on brand components
- **NO gradients** — `bg-gradient-*` classes are prohibited; fade effects must use solid color + opacity
- **NO glassmorphism** — `backdrop-blur-*` is prohibited except on nav scroll state (pre-existing, minimal)
- **NO rounded corners > 4px** — `rounded` (4px) and `rounded-sm` (2px) are allowed; `rounded-md` and above are prohibited
- **Grain texture** is global via `.grain::after` — do not remove it; do not add a second instance

### Image Treatment
- All editorial images must use one of three `TreatedImage` variants:
  - `editorial` — `.halftone` filter (contrast + partial grayscale)
  - `portrait` — `.halftone-heavy` + `.halftone-dots` wrapper (full newsprint treatment)
  - `hero` — `.duotone` filter (full grayscale + contrast, multiply blend)
- Raw, untreated photographs are not permitted in editorial contexts
- Placeholder images must use branded SVGs from `/placeholders/{content-type}.svg` (imported via `PLACEHOLDERS` from `@/lib/placeholders`), not generic gray boxes

### Section Structure
- **StarDivider** (`<StarDivider />`) is the canonical section separator — use it between content sections and as editorial break points
- **Red accent borders** (`.accent-border-top`, `.accent-border-bottom`) are used on CTAs and section-level containers, not on individual cards
- **Lens colors** are scoped to their lens: health (amber), politics (red), culture (tan), entertainment (purple), business (olive) — never mixed

### Prohibited Patterns
- Lifestyle photography (smiling, aspirational, consumer-coded)
- Generic UI icons (checkmarks, thumbs up, heart, star rating) — use the brand mark motif
- Hover states that soften the design (color lightening, opacity reduction on text) — hover states should increase visual weight or clarity
- "Cards" with rounded corners, soft shadows, or white backgrounds
- Generic SaaS button patterns (pill shapes, icon-only buttons without context)

---

## Accessibility Invariants (non-negotiable alongside brand)

- All interactive elements must have `focus-visible` styles (currently enforced globally via `*:focus-visible` in globals.css)
- Color contrast: all text must meet WCAG AA at minimum
- When brand color and contrast conflict: adjust opacity/weight of the brand color, preserve the intent
- Images must have descriptive `alt` text; decorative images must have `alt=""`
- `aria-hidden="true"` on all decorative SVGs, grain overlays, texture elements

---

## External Token Migration Rule

The BMJ color palette in `src/styles/brand.css` is the source of truth for the running application. If BMJ ever evaluates a migration to any external token package:

1. Verify that every `--bmj-*` variable maps to an identical hex value in the token output
2. If the token theme softens, warms, or alters any color, reject the migration for that token and keep the CSS variable
3. Brand fidelity overrides token standardization

---

## File Locations for Brand Work

| Asset | Location |
|-------|----------|
| CSS variables | `src/styles/brand.css` |
| Utility classes (grain, halftone, etc.) | `src/styles/globals.css` |
| Tailwind theme extension | `tailwind.config.ts` |
| OG image | `public/og-image.svg` |
| Placeholder images | `public/placeholders/*.svg` |
| Placeholder constants | `src/lib/placeholders.ts` |
| Logo / favicon | `public/favicon.svg` |
| Logo assets | `public/logos/` |
| Brand mark component | `src/components/brand/BrandMark.tsx` |
| Star divider | `src/components/ui/StarDivider.tsx` |
| Palette reference image | `docs/brand/bmj-palettes-reference.png` |
| Font files & licenses | `public/fonts/`, `public/fonts/LICENSES.md` |
| Full art direction spec | `docs/brand/art-direction-spec.md` |
