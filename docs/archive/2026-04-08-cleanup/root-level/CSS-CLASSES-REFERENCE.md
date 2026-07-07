---
title: CSS Classes Reference - Quick Lookup
authority: reference
status: active
audience: [engineers]
last-updated: 2026-04-09
---

# CSS Classes Reference - Quick Lookup

## Animation & Transition Classes

### Transition Timing
```css
.transition-smooth       /* 200ms cubic-bezier(0.25, 0.1, 0.25, 1) */
.transition-micro        /* 150ms cubic-bezier(0.4, 0, 0.2, 1) */
.transition-dramatic     /* 500ms cubic-bezier(0, 0, 0.2, 1) */
```

### Hover Effects
```css
.hover-lift              /* Lifts 4px, shadow increases */
.hover-lift-sm           /* Lifts 2px */
.hover-scale             /* Scales to 1.02x on hover, 0.98x on active */
.underline-animate       /* Red underline animates from left to right */
.border-glow             /* Gradient glow appears on hover */
```

---

## Shadow Classes

### Elevation Levels
```css
.shadow-elevation-1      /* Subtle: 0 1px 2px + 0 1px 3px */
.shadow-elevation-2      /* Medium: 0 4px 6px + 0 2px 4px */
.shadow-elevation-3      /* Strong: 0 10px 25px + 0 6px 10px */
.shadow-inset            /* Inset shadow: inset 0 2px 4px */
```

### Brand Glows
```css
.shadow-glow-red         /* Red ambient glow effect */
.shadow-glow-amber       /* Amber ambient glow effect */
```

---

## Surface & Panel Classes

### Panel Variants
```css
.surface-panel           /* Subtle border, subtle shadow */
.surface-panel-strong    /* Strong border, medium shadow */
.surface-panel-paper     /* Paper-like, darker interior text */
.surface-elevated        /* Maximum elevation for modals */
.surface-glass           /* Backdrop blur effect, 0.85 opacity */
```

### Card Variants
```css
.card-media              /* 3px top border, lifts 6px on hover */
.card-stripe             /* 4px left border, lifts 4px on hover */
.card-feature            /* 1px uniform border, shadow on hover */
.card-offer              /* 3px top + gradient, for premium content */
```

---

## Button Classes

### Button Variants
```css
.btn-primary             /* Red background, white text, lifts 2px */
.btn-secondary           /* Ghost red, red on hover */
.btn-ghost               /* Outline, subtle border */
.btn-amber               /* Amber accent for premium/support */
.btn-outline             /* Minimal, border only */
```

### Button Sizes
```css
.btn-xs                  /* Extra small: 3px horizontal, 1.5px vertical */
.btn-sm                  /* Small: 4px horizontal, 2px vertical */
.btn-lg                  /* Large: 8px horizontal, 3.5px vertical */
.btn-xl                  /* Extra large: 10px horizontal, 4px vertical */
```

### Icon Buttons
```css
.btn-icon                /* Icon with border and background on hover */
.btn-icon-square         /* Compact square icon button */
.btn-base                /* Base button styling (don't use directly) */
```

---

## Navigation Classes

### Navigation Links
```css
.nav-link                /* Base navigation link styling */
.nav-link-active         /* Active link with full red underline */
.nav-link::after         /* Red underline animation (pseudo-element) */
```

### Filter Tabs
```css
.filter-tab              /* Base filter tab styling */
.filter-tab-active       /* Active tab with full underline */
.filter-tab-inactive     /* Inactive tab with hover underline */
.filter-tab::after       /* Red underline indicator (pseudo-element) */
```

### Filter Chips
```css
.filter-chip             /* Base chip styling */
.filter-chip-active      /* Active chip: red background, white text */
.filter-chip-inactive    /* Inactive chip: brown background, hover brightens */
```

---

## Typography Classes

### Headings
```css
.page-title              /* h1 equivalent: clamp(2.5rem, 5vw + 1rem, 4.5rem) */
.section-title           /* h2 equivalent: clamp(2rem, 4vw + 0.5rem, 3.5rem) */
.subsection-title        /* h3 equivalent: text-2xl/text-3xl */
.card-title              /* h4 equivalent: text-xl, uppercase, tight leading */
```

### Semantic Text
```css
.editorial-kicker        /* Category label: small, uppercase, tan color */
.editorial-deck          /* Intro paragraph: larger, slightly muted */
.lead-text               /* Opening paragraph: larger than body */
.body-text               /* Regular article text: optimal reading */
.small-text              /* Captions and footnotes: smaller, muted */
.byline                  /* Author attribution: xs, uppercase, tan */
.quote-text              /* Pull quotes: italic, larger, cream color */
.meta-stamp              /* Metadata: monospace, uppercase, tabular nums */
```

---

## Effect Classes

### Glass & Blur
```css
.glass                   /* Backdrop blur 12px, 0.8 opacity */
.glass-strong            /* Backdrop blur 20px, 0.9 opacity */
```

### Gradients
```css
.gradient-fade-up        /* Linear gradient bottom to top */
.gradient-fade-down      /* Linear gradient top to bottom */
.gradient-scrim          /* Dark gradient overlay (best for images) */
```

### Image Effects
```css
.halftone                /* Soft print effect: contrast 1.2, grayscale 0.3 */
.halftone-heavy          /* Heavy newsprint: contrast 1.6, grayscale 1 */
.halftone-dots::after    /* Dot pattern overlay (on parent) */
.duotone                 /* Grayscale with contrast: 1.3 */
```

### Text Effects
```css
.marker, mark            /* Red highlight box with skew */
.paper-texture::before   /* Aged paper texture overlay */
.grain::after            /* Film grain overlay (fixed position, page-wide) */
```

### Borders
```css
.accent-border-top       /* 3px red top border */
.accent-border-bottom    /* 3px red bottom border */
```

---

## Accessibility Classes

### Screen Reader
```css
.sr-only                 /* Visually hidden, available to screen readers */
.skip-link               /* Keyboard navigation link, shows on focus */
```

### Focus Management
```css
:focus-visible           /* Auto-applied: 2px red outline */
/* High contrast mode: 3px outline, 3px offset */
```

---

## Responsive Classes

### Grids
```css
.grid-responsive-2       /* 1 col mobile, 2 col tablet, 2 col desktop */
.grid-responsive-3       /* 1 col mobile, 2 col tablet, 3 col desktop */
.image-grid              /* Auto-fit responsive image grid */
```

### Spacing
```css
.gap-responsive          /* gap-3 mobile, gap-4 tablet, gap-6 desktop */
.page-shell              /* Max-width container with responsive padding */
```

---

## Tailwind Extended Classes

These classes are available via Tailwind's extended configuration:

### Shadow Utilities
```css
shadow-elevation-1       /* Tailwind syntax for --shadow-sm */
shadow-elevation-2       /* Tailwind syntax for --shadow-md */
shadow-elevation-3       /* Tailwind syntax for --shadow-lg */
shadow-elevation-4       /* Tailwind syntax for --shadow-xl */
shadow-card              /* Card shadow with border glow */
shadow-card-hover        /* Card shadow on hover */
shadow-glow-red          /* Brand red glow */
shadow-glow-amber        /* Premium amber glow */
```

### Animations
```css
animate-fade-in          /* Opacity 0 to 1 in 300ms */
animate-fade-in-up       /* Opacity 0, translateY 16px to full */
animate-fade-in-down     /* Opacity 0, translateY -16px to full */
animate-scale-in         /* Opacity 0, scale 0.95 to full */
animate-slide-in-right   /* Opacity 0, translateX 24px to full */
animate-slide-in-left    /* Opacity 0, translateX -24px to full */
animate-pulse-subtle     /* Opacity pulse 1 to 0.85 */
animate-shimmer          /* Shimmer effect loop */
```

### Duration Classes
```css
duration-fast            /* 150ms */
duration-normal          /* 200ms */
duration-slow            /* 300ms */
duration-dramatic        /* 500ms */
```

### Z-Index Utilities
```css
z-dropdown               /* z-index: 100 */
z-sticky                 /* z-index: 200 */
z-fixed                  /* z-index: 300 */
z-modal-backdrop         /* z-index: 400 */
z-modal                  /* z-index: 500 */
z-popover                /* z-index: 600 */
z-tooltip                /* z-index: 700 */
z-notification           /* z-index: 800 */
z-grain                  /* z-index: 9999 */
```

---

## Common Combinations

### Hero Button
```html
<button class="btn-primary hover-lift shadow-elevation-2">
  Primary CTA
</button>
```

### Article Card
```html
<div class="card-media hover-lift">
  <img src="article.jpg" />
  <div class="p-6">
    <h3 class="card-title">Article Title</h3>
    <p class="small-text">Summary</p>
  </div>
</div>
```

### Navigation
```html
<nav class="flex gap-6">
  <a href="/" class="nav-link nav-link-active">Home</a>
  <a href="/articles" class="nav-link">Articles</a>
</nav>
```

### Filter Section
```html
<div>
  <div class="flex gap-8 border-b">
    <button class="filter-tab filter-tab-active">All</button>
    <button class="filter-tab filter-tab-inactive">Featured</button>
  </div>
  <div class="flex gap-2 mt-4">
    <button class="filter-chip filter-chip-active">Active</button>
    <button class="filter-chip filter-chip-inactive">Inactive</button>
  </div>
</div>
```

### Responsive Layout
```html
<div class="grid grid-responsive-3 gap-responsive">
  {items.map(item => (
    <div key={item.id} class="card-feature">
      {item.content}
    </div>
  ))}
</div>
```

---

## CSS Variables Reference

### Colors (from brand.css)
```css
--bmj-black              /* #0D0C0B - Main background */
--bmj-deep-black         /* #0A0A0A - Darker variant */
--bmj-white              /* #FFFFFF - Pure white */
--bmj-cream              /* #F2EDDC - Light text */
--bmj-tan                /* #B8986A - Accent tan */
--bmj-red                /* #C0281F - Primary red */
--bmj-crimson            /* #A01815 - Red hover state */
--bmj-amber              /* #C8852A - Premium accent */
--bmj-olive              /* #4A5E2E - Muted green */
```

### Shadows (from brand.css)
```css
--shadow-sm              /* 0 1px 2px + 0 1px 3px */
--shadow-md              /* 0 4px 6px + 0 2px 4px */
--shadow-lg              /* 0 10px 25px + 0 6px 10px */
--shadow-xl              /* 0 20px 40px + 0 15px 20px */
--shadow-card            /* Card shadows with border accent */
--shadow-card-hover      /* Enhanced card shadow */
--shadow-glow-red        /* Red ambient glow */
--shadow-glow-amber      /* Amber ambient glow */
```

### Transitions (from brand.css)
```css
--transition-fast        /* 150ms cubic-bezier(0.4, 0, 0.2, 1) */
--transition-normal      /* 200ms cubic-bezier(0.25, 0.1, 0.25, 1) */
--transition-slow        /* 300ms cubic-bezier(0.25, 0.1, 0.25, 1) */
--transition-dramatic    /* 500ms cubic-bezier(0, 0, 0.2, 1) */
```

### Z-Index (from brand.css)
```css
--z-base                 /* 0 */
--z-dropdown             /* 100 */
--z-sticky               /* 200 */
--z-fixed                /* 300 */
--z-modal-backdrop       /* 400 */
--z-modal                /* 500 */
--z-popover              /* 600 */
--z-tooltip              /* 700 */
--z-notification         /* 800 */
--z-grain                /* 9999 */
```

---

## Mobile-First Responsive Strategy

### Breakpoints
```css
@media (max-width: 640px)          /* Mobile: < 641px */
@media (min-width: 641px) and (max-width: 1024px)  /* Tablet */
@media (min-width: 1025px)         /* Desktop: > 1025px */
```

### Touch Devices
```css
@media (hover: none) and (pointer: coarse)  /* Touch devices */
```

### Orientation
```css
@media (orientation: landscape)    /* Landscape mode */
@media (orientation: portrait)     /* Portrait mode */
```

### Preferences
```css
@media (prefers-reduced-motion: reduce)    /* Reduced motion */
@media (prefers-contrast: more)            /* High contrast mode */
```

---

## Implementation Checklist

Before using these classes in production:
- [ ] Test animations at 60fps on target devices
- [ ] Verify focus rings visible on keyboard navigation
- [ ] Confirm touch targets 48px+ on mobile
- [ ] Check text scales smoothly 375px to 1440px
- [ ] Validate reduced motion preferences work
- [ ] Test high contrast mode rendering
- [ ] Verify no console errors
- [ ] Run Lighthouse audit (>80 performance)

---

## Related Documentation

- `docs/BEAUTIFICATION-ENHANCEMENTS.md` — Full technical documentation
- `docs/BEAUTIFICATION-IMPLEMENTATION-GUIDE.md` — Code examples and patterns
- `src/styles/globals.css` — All CSS class implementations
- `src/styles/brand.css` — CSS variable definitions
- `tailwind.config.ts` — Extended Tailwind configuration
