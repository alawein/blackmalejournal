---
name: bmj-ui-optimizer
description: Use when building or reviewing UI for user-friendliness, accessibility, responsive design, or visual polish. Triggers on "improve UX", "accessibility audit", "responsive fix", "mobile layout", "a11y", "WCAG", "user experience".
---

# BMJ UI/UX Optimizer

Make every page usable, accessible, and visually polished across devices.

## Doc context (Tier A/B)

[AGENTS.md](../../AGENTS.md), [CLAUDE.md](../../CLAUDE.md), [docs/standards/agent-knowledge-protocol.md](../../docs/standards/agent-knowledge-protocol.md). **Task-scoped:** [docs/brand/invariants.md](../../docs/brand/invariants.md), [docs/brand/visual-ssot.md](../../docs/brand/visual-ssot.md), `.claude/rules/brand.md` — do not paraphrase palette or prohibited styles; read those files for disputes.

## Brand Constraints (non-negotiable)

- Colors: only `var(--bmj-*)` tokens from `src/styles/brand.css`
- Fonts: Highrise (display), Libre Baskerville (body), Oswald (labels), IBM Plex Mono (dates)
- No border-radius > 4px, no drop shadows, no gradients, no glassmorphism
- Grain overlay on body, halftone on images, paper-texture on editorial surfaces

## Accessibility Checklist

| Rule | Implementation |
|------|---------------|
| Color contrast | bmj-cream on bmj-black = 12.4:1 (AAA). Test accent colors with `tests/helpers/contrast.ts` |
| Keyboard navigation | All interactive elements focusable, visible focus ring, no focus traps |
| Screen readers | Semantic HTML (`<nav>`, `<main>`, `<article>`), `aria-label` on icon buttons, `aria-hidden` on decorative SVGs |
| Reduced motion | `useReducedMotion()` in all Framer Motion components — skip animations entirely |
| Alt text | Every `<Image>` has descriptive alt. Decorative images use `alt=""` |
| Form labels | Every input has a visible `<label>` or `aria-label`. Error messages linked via `aria-describedby` |
| Skip link | First focusable element should skip to `<main>` |

## Responsive Breakpoints

```
375px  — mobile (minimum supported)
768px  — tablet (md:)
1024px — desktop (lg:)
1440px — wide (max-w-wide)
```

- Test every page at 375px and 1440px (per CLAUDE.md)
- Use `page-shell` / `page-shell-tight` for consistent max-widths
- Mobile-first: base styles for 375px, then `md:` and `lg:` overrides

## Motion & Texture Patterns

| Pattern | Component | When to Use |
|---------|-----------|-------------|
| Page fade-in | `PageTransition` | Already on all pages via layout.tsx |
| Scroll reveal | `ScrollReveal` | Wrap major page sections (header, body, related content) |
| Paper texture | `.paper-texture` class | Editorial surfaces: prose blocks, quote cards, briefing sections |
| Halftone | `.halftone` / `.halftone-heavy` | All content images |
| Grain | `.grain` on body | Global — already applied |

Usage:
```tsx
import { ScrollReveal } from '@/components/motion/ScrollReveal';
<ScrollReveal as="section" delay={0.1}>
  <div className="paper-texture">...</div>
</ScrollReveal>
```

## Common UX Patterns

- **Empty states**: Use `<EmptyState>` component, never show blank containers
- **Loading**: Use `<Skeleton>` components in loading.tsx files
- **Error feedback**: Inline error messages near the input, not toasts or alerts
- **Navigation**: Active link highlighted in navbar, breadcrumbs on detail pages
- **Back to top**: `<BackToTop>` on long pages (auto-appears on scroll)
- **Search**: `<SearchDialog>` accessible via navbar, keyboard shortcut

## Quick Audit Command

Check a page against these standards:
1. Lighthouse accessibility score (target: 95+)
2. Tab through every interactive element
3. Resize to 375px — does everything still work?
4. Turn off images — does content still make sense?
5. `useReducedMotion` — do animations respect the preference?
