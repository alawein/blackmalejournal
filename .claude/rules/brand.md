# Brand System -- Hard Invariants

Violations are blocking defects. Source of truth: `src/styles/brand.css`

## Core Colors (use CSS variables)
- --bmj-black: #0D0C0B (backgrounds)
- --bmj-cream: #E8DCC8 (primary text on dark)
- --bmj-red: #C0281F (accents, brand mark, borders)
- --bmj-amber: #C8852A (quote cards, highlights)
- --bmj-brown: #3B2417 (secondary backgrounds)
- --bmj-tan: #B8986A (metadata, dates)
- --bmj-white: #F2EDE4 (maximum contrast text)

## Sectional Accent Colors (wired in CSS, used only with content domains)
- --bmj-paper: #F0DDBC (lighter paper ground)
- --bmj-deep-black: #1C130E (heavier typographic weight)
- --bmj-crimson: #712414 (politics accent)
- --bmj-medium-brown: #5D3F2E (culture/editorial)
- --bmj-olive: #416100 (health/wellness)
- --bmj-gold: #C77A0E (finance/business)
- --bmj-purple: #554978 (technology -- deferred until taxonomy expansion)

## Fonts
- Display/Headlines: Highrise (self-hosted, next/font/local) -- always ALL-CAPS
- Body: Libre Baskerville (next/font/google) -- editorial serif
- Labels: Oswald (next/font/google) -- caps, wide tracking
- Mono: IBM Plex Mono (next/font/google) -- dates, issue numbers
- Font files: public/fonts/ -- see public/fonts/LICENSES.md

## Prohibited
Pastels, gradients, blue, neon, purple outside its designated section context,
rounded corners > 4px, drop shadows, glassmorphism, "modern SaaS" aesthetic.

## Visual Language
- Militant print-driven editorial -- revolutionary newspapers, political posters, movement literature
- Grain overlay on all sections, halftone dots on images
- Brand mark: `<BrandMark />` from `src/components/brand/BrandMark.tsx`
- Section dividers: `<StarDivider />` and `<BrandMark />`
