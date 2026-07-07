---
title: Beautification Implementation Guide
authority: reference
status: active
audience: [engineers]
last-updated: 2026-04-09
---

# Beautification Implementation Guide

## Quick Start

All beautification enhancements are already integrated into the site. No additional installation needed. This guide shows developers how to use the new CSS classes and utilities.

---

## 1. Using Animations & Transitions

### Basic Transitions
```tsx
// Smooth transition on all interactive elements
<button className="transition-smooth">Hover me</button>

// Fast micro-interaction for buttons
<button className="transition-micro">Quick feedback</button>

// Slow dramatic entrance
<div className="transition-dramatic">Entrance animation</div>
```

### Hover Lifts
```tsx
// Cards that lift on hover (standard 6px lift for media cards)
<div className="card-media hover-lift">
  <img src="article.jpg" />
  <h3>Article Title</h3>
</div>

// Smaller lift for minor elements (2px)
<div className="hover-lift-sm">Subtle element</div>

// Scale effect for buttons and icons
<button className="hover-scale">Click me</button>
```

### Framer Motion Animations (in `.tsx` components)
```tsx
'use client';
import { motion } from 'framer-motion';
import { pageTransition, fadeInUp, staggerContainer } from '@/lib/animations';

export function Hero() {
  return (
    <motion.div variants={staggerContainer}>
      <motion.h1 variants={pageTransition}>
        Stunning Headline
      </motion.h1>
      <motion.p variants={fadeInUp}>
        Opening paragraph
      </motion.p>
    </motion.div>
  );
}
```

---

## 2. Typography Classes

### Semantic Headings
```tsx
<h1 className="page-title">Page Heading</h1>
<h2 className="section-title">Section Heading</h2>
<h3 className="subsection-title">Subsection</h3>
<h4 className="card-title">Card Title</h4>
```

### Body Text
```tsx
<p className="editorial-deck">Opening/intro paragraph</p>
<p className="lead-text">Emphasized body paragraph</p>
<p className="body-text">Regular article text</p>
<p className="small-text">Captions and footnotes</p>

<blockquote className="quote-text">"Pull quote text"</blockquote>
<p className="byline">By Author Name</p>
```

### Text Effects
```tsx
// Highlighted text with red marker
<p>This is <mark>highlighted</mark> text</p>

// Custom marker
<p>This is <span className="marker">marked</span> text</p>
```

---

## 3. Depth & Shadow System

### Surface Panels
```tsx
// Standard panel with subtle shadow
<div className="surface-panel">Content</div>

// Stronger panel for emphasis
<div className="surface-panel-strong">Important content</div>

// Paper-like background (light colored interior)
<div className="surface-panel-paper">Light text content</div>

// Maximum elevation for modals
<div className="surface-elevated">Modal content</div>

// Backdrop blur effect
<div className="surface-glass">Floating content</div>
```

### Shadow Classes
```tsx
// Direct shadow utility classes
<div className="shadow-elevation-1">Subtle shadow</div>
<div className="shadow-elevation-2">Medium shadow</div>
<div className="shadow-elevation-3">Strong shadow</div>

// Brand glow effects
<div className="shadow-glow-red">Red accent glow</div>
<div className="shadow-glow-amber">Amber glow for premium</div>
```

---

## 4. Button Components

### Button Variants
```tsx
// Primary call-to-action
<button className="btn-primary">Primary CTA</button>

// Secondary action
<button className="btn-secondary">Secondary</button>

// Minimal ghost button
<button className="btn-ghost">Ghost button</button>

// Amber for premium/support
<button className="btn-amber">Support CTA</button>

// Outline only
<button className="btn-outline">Outline button</button>
```

### Button Sizes
```tsx
<button className="btn-primary btn-xs">Extra small</button>
<button className="btn-primary btn-sm">Small</button>
<button className="btn-primary">Default</button>
<button className="btn-primary btn-lg">Large</button>
<button className="btn-primary btn-xl">Extra large</button>
```

### Icon Buttons
```tsx
<button className="btn-icon">
  <Icon />
</button>

<button className="btn-icon-square">
  <Icon />
</button>
```

### Disabled State
```tsx
<button className="btn-primary" disabled>
  Disabled button
</button>
```

---

## 5. Card Components

### Card Variants

**Media Card** (top border emphasis)
```tsx
<div className="card-media">
  <img src="article.jpg" />
  <div className="p-6">
    <h3 className="card-title">Article Title</h3>
    <p className="small-text">Summary text</p>
  </div>
</div>
```

**Stripe Card** (left border emphasis)
```tsx
<div className="card-stripe">
  <div className="p-6">
    <h3 className="card-title">Briefing Title</h3>
    <p className="small-text">Summary</p>
  </div>
</div>
```

**Feature Card** (uniform border)
```tsx
<div className="card-feature">
  <div className="p-6">
    <h3 className="card-title">Featured Item</h3>
  </div>
</div>
```

**Offer Card** (gradient with top border)
```tsx
<div className="card-offer">
  <div className="p-6">
    <h3 className="card-title">Premium Content</h3>
    <button className="btn-amber">Subscribe</button>
  </div>
</div>
```

---

## 6. Navigation Components

### Navigation Links
```tsx
<nav className="flex gap-6">
  <a href="/" className="nav-link nav-link-active">Home</a>
  <a href="/articles" className="nav-link">Articles</a>
  <a href="/briefings" className="nav-link">Briefings</a>
</nav>
```

### Filter Tabs
```tsx
<div className="flex gap-8 border-b border-bmj-border-subtle">
  <button className="filter-tab filter-tab-active">All</button>
  <button className="filter-tab filter-tab-inactive">Featured</button>
  <button className="filter-tab filter-tab-inactive">New</button>
</div>
```

### Filter Chips
```tsx
<div className="flex gap-2 flex-wrap">
  <button className="filter-chip filter-chip-active">Active</button>
  <button className="filter-chip filter-chip-inactive">Inactive</button>
  <button className="filter-chip filter-chip-inactive">Other</button>
</div>
```

---

## 7. Responsive Design

### Responsive Grid
```tsx
// Auto-adjusts: 1 column on mobile, 3 on desktop
<div className="grid grid-responsive-3 gap-responsive">
  {items.map(item => (
    <div key={item.id} className="card-feature">
      {item.content}
    </div>
  ))}
</div>
```

### Responsive Image Grid
```tsx
<div className="image-grid">
  <img src="image1.jpg" alt="Image 1" />
  <img src="image2.jpg" alt="Image 2" />
  <img src="image3.jpg" alt="Image 3" />
</div>
```

### Breakpoint-Specific Classes
```tsx
// Show/hide based on screen size
<div className="hidden md:block">Desktop only</div>
<div className="md:hidden">Mobile only</div>

// Adjust spacing responsively
<div className="px-4 sm:px-6 lg:px-8">Responsive padding</div>
<div className="gap-3 sm:gap-4 lg:gap-6">Responsive gap</div>
```

---

## 8. Accessibility Features

### Screen Reader Text
```tsx
<button>
  <Icon />
  <span className="sr-only">Close menu</span>
</button>
```

### Skip Link
```tsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

### Focus Management
```tsx
// Auto-applied with :focus-visible
// Red outline appears only on keyboard focus
<button>Click me</button>

// Remove focus outline programmatically (not recommended)
<button className="outline-none">No focus ring</button>
```

---

## 9. Image Effects

### Halftone Images
```tsx
// Soft print-like effect
<img src="photo.jpg" className="halftone" alt="Photo" />

// Heavy newsprint effect
<img src="photo.jpg" className="halftone-heavy" alt="Photo" />

// Grayscale with contrast
<img src="photo.jpg" className="duotone" alt="Photo" />
```

### Texture Overlays
```tsx
// Paper texture overlay
<div className="paper-texture">
  <img src="photo.jpg" alt="Photo" />
</div>

// Grain overlay (entire page)
<body className="grain">
  {/* content */}
</body>
```

---

## 10. Glass & Gradient Effects

### Glass Effect
```tsx
// Subtle blur background
<div className="glass">
  <p>Content on blurred background</p>
</div>

// Stronger blur
<div className="glass-strong">
  <p>Strong blur effect</p>
</div>
```

### Gradient Overlays
```tsx
// Fade up from bottom
<div className="gradient-fade-up"></div>

// Fade down from top
<div className="gradient-fade-down"></div>

// Image scrim (dark gradient overlay)
<div className="gradient-scrim">
  {/* Content over image */}
</div>
```

### Border Glow
```tsx
// Gradient glow appears on hover
<div className="border-glow border border-bmj-tan/30 rounded p-6">
  Content with glow effect
</div>
```

---

## CSS Variables Reference

### Use in Custom CSS
```css
/* Shadows */
box-shadow: var(--shadow-card);
box-shadow: var(--shadow-card-hover);

/* Transitions */
transition: all var(--transition-normal);
transition-timing-function: var(--transition-smooth);

/* Colors (from brand.css) */
color: var(--bmj-red);
background-color: var(--bmj-black);
border-color: var(--bmj-tan);

/* Z-Index */
z-index: var(--z-modal);
z-index: var(--z-notification);
```

---

## Tailwind Extended Configuration

These shadow and animation classes are available via extended Tailwind config:

```tsx
// Shadow tokens (Tailwind utility class syntax)
<div className="shadow-elevation-1">...</div>
<div className="shadow-card">...</div>
<div className="shadow-glow-red">...</div>

// Animation tokens
<div className="animate-fade-in">...</div>
<div className="animate-fade-in-up">...</div>
<div className="animate-scale-in">...</div>
<div className="animate-pulse-subtle">...</div>

// Transition durations
<div className="transition duration-fast">...</div>
<div className="transition duration-normal">...</div>
<div className="transition duration-slow">...</div>
<div className="transition duration-dramatic">...</div>

// Z-Index scale
<div className="z-modal">...</div>
<div className="z-tooltip">...</div>
```

---

## Common Patterns

### Hero Section
```tsx
<section className="py-16 sm:py-24 lg:py-32">
  <div className="page-shell">
    <div className="transition-dramatic">
      <h1 className="page-title">
        Stunning Title
      </h1>
      <p className="editorial-deck mt-6">
        Opening paragraph
      </p>
      <div className="mt-8 flex gap-4">
        <button className="btn-primary">Primary CTA</button>
        <button className="btn-ghost">Secondary CTA</button>
      </div>
    </div>
  </div>
</section>
```

### Card Grid
```tsx
<section className="py-12">
  <div className="page-shell">
    <h2 className="section-title mb-8">Featured Articles</h2>
    <div className="grid grid-responsive-3 gap-responsive">
      {articles.map(article => (
        <div key={article.id} className="card-media hover-lift">
          <img 
            src={article.cover} 
            alt={article.title}
            className="aspect-video object-cover"
          />
          <div className="p-6">
            <h3 className="card-title">{article.title}</h3>
            <p className="small-text text-bmj-cream/70">
              {article.excerpt}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Navigation with Underline Animation
```tsx
<nav className="flex gap-8">
  {navItems.map(item => (
    <Link
      key={item.href}
      href={item.href}
      className={`nav-link ${
        isActive(item.href) ? 'nav-link-active' : ''
      }`}
    >
      {item.label}
    </Link>
  ))}
</nav>
```

---

## Performance Tips

1. **Avoid Excessive Animations**: Use `transition-smooth` on interactive elements, not entire pages
2. **Respect Prefers-Reduced-Motion**: System automatically disables animations for users who prefer reduced motion
3. **Use Transform-Only Animations**: Lift effects use `translateY()` for GPU acceleration
4. **Lazy Load Images**: Add `loading="lazy"` to images below the fold
5. **Optimize Images**: Use SVG for logos, optimized JPEG for photography

---

## Troubleshooting

**Animations not working?**
- Check if `prefers-reduced-motion` is enabled in OS settings
- Run `npm install` to ensure project dependencies are installed

**Focus rings not visible?**
- Check browser DevTools: Focus rings appear with `:focus-visible`
- Press `Tab` key to navigate (mouse focus doesn't show ring)

**Shadows look wrong?**
- Verify element has `position: relative` or `position: absolute`
- Check z-index doesn't conflict with stacking context

**Typography not scaling?**
- Use semantic classes (`.page-title`, `.card-title`) instead of manual sizing
- Fluid sizing uses `clamp()` — works on all modern browsers

---

## Related Files

- `src/lib/animations.ts` — Animation presets and utilities
- `src/styles/globals.css` — All CSS classes and utilities
- `src/styles/brand.css` — Shadow and transition tokens
- `tailwind.config.ts` — Extended Tailwind configuration
- `docs/BEAUTIFICATION-ENHANCEMENTS.md` — Detailed enhancement documentation
