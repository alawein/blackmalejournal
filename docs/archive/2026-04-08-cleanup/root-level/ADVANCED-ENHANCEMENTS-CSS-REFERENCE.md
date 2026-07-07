---
title: Advanced Enhancements — Visual & CSS Reference Card
authority: reference
status: active
audience: [engineers, designers]
last-updated: 2026-04-08
---

# Advanced Enhancements — Visual & CSS Reference Card

Quick reference for all advanced CSS classes and their properties.

## Animation Duration Variables
```css
--duration-micro: 150ms;   /* Button feedback, tooltips */
--duration-fast: 200ms;    /* Pop animations, transitions */
--duration-normal: 300ms;  /* Standard animations */
--duration-slow: 500ms;    /* Entrance effects, page transitions */
```

---

## Typography Effects

### Text Gradient Animation
```css
.text-gradient-animate {
  background: linear-gradient(90deg, white, red, amber, white);
  animation: gradientShift 6s ease infinite;
}
```
**Use:** Hero headlines, featured article titles  
**Duration:** 6s continuous loop  
**Effect:** Smooth color transition through palette

### Headline Letter-Spacing
```css
.headline-breathe:hover {
  letter-spacing: 0.1em;
  transition: letter-spacing 300ms;
}
```
**Use:** All headlines, section titles  
**Duration:** 300ms  
**Effect:** Expands by 0.1em on hover

### Text Glow
```css
.text-glow-red {
  text-shadow: 0 0 10px rgba(192, 40, 31, 0.3),
               0 0 20px rgba(192, 40, 31, 0.15);
}

.text-glow-amber {
  text-shadow: 0 0 10px rgba(200, 133, 42, 0.3),
               0 0 20px rgba(200, 133, 42, 0.15);
}
```
**Use:** Emphasis, featured content, premium badges  
**Colors:** Red or Amber  
**Effect:** Multi-layer shadow glow

---

## Micro-Interactions

### Icon Bounce
```css
.icon-bounce:hover {
  animation: bounce 600ms ease-out;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
```
**Use:** CTA buttons with icons  
**Duration:** 600ms  
**Amplitude:** 8px  
**Trigger:** Hover

### Button Press Feedback
```css
.btn-press-feedback:active {
  transform: scale(0.95) translateY(2px);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}
```
**Use:** All interactive buttons  
**Scale:** 0.95 (5% compress)  
**Movement:** 2px down  
**Effect:** Pressed appearance

### Tooltip Pop
```css
.tooltip-pop {
  animation: tooltipPop 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes tooltipPop {
  0% { opacity: 0; transform: scale(0.8) translateY(8px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
```
**Use:** Hover tooltips, floating labels  
**Duration:** 200ms  
**Easing:** Elastic cubic-bezier  
**Effect:** Pop-in from bottom

### Ripple Effect
```css
.ripple::after {
  animation: rippleEffect 600ms ease-out;
}

@keyframes rippleEffect {
  0% { width: 0; height: 0; opacity: 1; }
  100% { width: 300px; height: 300px; opacity: 0; }
}
```
**Use:** Interactive buttons, click feedback  
**Duration:** 600ms  
**Max Size:** 300px diameter  
**Effect:** Expanding ripple on click

---

## Modern UI Elements

### Glassmorphism Card
```css
.card-glass {
  background: rgba(28, 19, 14, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(184, 152, 106, 0.2);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.card-glass:hover {
  border-color: rgba(184, 152, 106, 0.3);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}
```
**Use:** Premium content, featured sections  
**Blur:** 12px backdrop blur  
**Opacity:** 85% background  
**Effect:** Frosted glass appearance

### Neumorphic Button
```css
.btn-neumorphic {
  background: linear-gradient(145deg, #1C130E, #0D0C0B);
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.5),
              -5px -5px 15px rgba(255, 255, 255, 0.05);
}

.btn-neumorphic:hover {
  box-shadow: 7px 7px 20px rgba(0, 0, 0, 0.6),
              -7px -7px 20px rgba(255, 255, 255, 0.08);
}
```
**Use:** Premium buttons, special actions  
**Depth:** Dual shadow (outer + inner)  
**Effect:** Subtle 3D appearance

### Modern Modal
```css
.modal-modern {
  background: linear-gradient(135deg, rgba(28, 19, 14, 0.95) 0%, 
                                      rgba(13, 12, 11, 0.95) 100%);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(184, 152, 106, 0.15);
}
```
**Use:** Modals, dialogs, popups  
**Gradient:** Brown gradient (135°)  
**Shadow:** 20px spread, 60px blur  
**Effect:** Refined, premium appearance

### Animated Border
```css
.card-border-animate {
  border: 2px solid transparent;
  background: var(--bmj-black);
}

.card-border-animate::before {
  animation: borderShift 3s linear infinite;
}

@keyframes borderShift {
  0% { filter: hue-rotate(0deg); opacity: 1; }
  100% { filter: hue-rotate(360deg); opacity: 1; }
}
```
**Use:** Featured cards, premium products  
**Duration:** 3s continuous loop  
**Colors:** Red → Amber spectrum  
**Effect:** Rotating gradient border

---

## Background Patterns

### Diagonal Lines
```css
.pattern-diagonal {
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 35px,
    rgba(184, 152, 106, 0.02) 35px,
    rgba(184, 152, 106, 0.02) 70px
  );
}
```
**Use:** Section backgrounds, subtle texture  
**Angle:** 45°  
**Spacing:** 35px lines, 70px total repeat  
**Opacity:** 2%  

### Duotone Overlay
```css
.duotone::after {
  background: linear-gradient(135deg, rgba(59, 36, 23, 0.7), 
                                      rgba(192, 40, 31, 0.2));
  mix-blend-mode: multiply;
  pointer-events: none;
}
```
**Use:** Images, editorial photos  
**Gradient:** Brown to red (135°)  
**Blend:** Multiply  
**Effect:** Magazine-style coloring

---

## State Indicators

### Success State
```css
.state-success {
  border-left: 4px solid #4CAF50;
  background-color: rgba(76, 175, 80, 0.1);
  padding-left: var(--space-md);
}
```
**Use:** Confirmation messages, form success  
**Color:** Green (#4CAF50)  
**Effect:** Left border + tinted background

### Error State
```css
.state-error {
  border-left: 4px solid var(--bmj-red);
  background-color: rgba(192, 40, 31, 0.1);
  padding-left: var(--space-md);
}
```
**Use:** Error messages, validation failures  
**Color:** Red  
**Effect:** Left border + tinted background

### Warning State
```css
.state-warning {
  border-left: 4px solid var(--bmj-amber);
  background-color: rgba(200, 133, 42, 0.1);
  padding-left: var(--space-md);
}
```
**Use:** Warning messages, cautions  
**Color:** Amber  
**Effect:** Left border + tinted background

---

## Loading & Progress

### Loading Pulse
```css
.loading-pulse {
  animation: loadingPulse 1.5s ease-in-out infinite;
}

@keyframes loadingPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
```
**Use:** Skeleton screens, loading placeholders  
**Duration:** 1.5s  
**Range:** 0.5 to 1 opacity  
**Effect:** Subtle pulsing

### Progress Bar
```css
.progress-bar {
  height: 4px;
  background-color: rgba(184, 152, 106, 0.2);
  border-radius: 2px;
}

.progress-bar::after {
  background: linear-gradient(90deg, var(--bmj-red), var(--bmj-amber));
  width: var(--progress, 0%);
  transition: width 300ms ease;
}
```
**Use:** File uploads, downloads, form progress  
**Height:** 4px  
**Colors:** Red to Amber gradient  
**Variable:** `--progress` (0-100%)

---

## Navigation

### Breadcrumb
```css
.breadcrumb-item::before {
  content: "→";
  margin: 0 var(--space-md);
  color: var(--bmj-tan);
  opacity: 0.5;
}

.breadcrumb-item:hover::before {
  opacity: 1;
  color: var(--bmj-red);
}

.breadcrumb-item.active::before {
  display: none;
}
```
**Use:** Navigation breadcrumbs  
**Arrow:** → character  
**Active:** Bold, white text  
**Effect:** Hover shows arrow in red

### Keyboard Focus
```css
.keyboard-focused {
  background-color: rgba(192, 40, 31, 0.1);
  border-left: 4px solid var(--bmj-red);
  padding-left: var(--space-md);
}
```
**Use:** Tab navigation focus indicator  
**Color:** Red left border  
**Background:** Light red tint  

---

## Responsive Typography

### Hero Title
```css
.hero-title {
  font-size: clamp(2rem, 8vw + 1rem, 5rem);
  line-height: 1.1;
}
```
**Minimum:** 2rem (32px)  
**Preferred:** 8vw + 1rem  
**Maximum:** 5rem (80px)  
**Use:** Page hero headlines

### Hero Subtitle
```css
.hero-subtitle {
  font-size: clamp(1rem, 4vw + 0.5rem, 2rem);
  line-height: 1.3;
}
```
**Minimum:** 1rem (16px)  
**Preferred:** 4vw + 0.5rem  
**Maximum:** 2rem (32px)  
**Use:** Subtitle text

### Section Headline
```css
.section-headline {
  font-size: clamp(1.5rem, 5vw + 0.5rem, 3rem);
  line-height: 1.2;
}
```
**Minimum:** 1.5rem (24px)  
**Preferred:** 5vw + 0.5rem  
**Maximum:** 3rem (48px)  
**Use:** Section headers

---

## Accessibility

### Focus State
```css
:focus-visible {
  outline: 3px solid var(--bmj-red);
  outline-offset: 4px;
  border-radius: 2px;
}
```
**Use:** All interactive elements  
**Width:** 3px  
**Color:** Red  
**Offset:** 4px

### High Contrast Mode
```css
@media (prefers-contrast: more) {
  body { font-weight: 500; }
  .btn-primary { border-width: 2px; }
}
```
**Trigger:** Windows high contrast mode  
**Effect:** Thicker borders, enhanced shadows

---

## Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 120+ | ✓ Full |
| Firefox | 121+ | ✓ Full |
| Safari | 17+ | ✓ Full |
| iOS Safari | 17+ | ✓ Full |
| Chrome Android | 120+ | ✓ Full |
| Edge | 120+ | ✓ Full |

All features use standard CSS with vendor prefixes where needed (e.g., `-webkit-backdrop-filter`).

---

## Quick Copy-Paste Examples

**Featured Article:**
```html
<article class="card-glass card-border-animate">
  <img src="..." alt="..." class="duotone" />
  <h3 class="text-gradient-animate headline-breathe">
    Featured Article
  </h3>
</article>
```

**Premium CTA:**
```html
<button class="btn-primary btn-lg icon-bounce">
  ✓ Upgrade Now
</button>
```

**Form Validation:**
```html
<div class="state-success">
  ✓ Account created successfully!
</div>
```

**Progress Indicator:**
```html
<div class="progress-bar" style="--progress: 75%"></div>
```

**Navigation:**
```html
<nav class="flex gap-2">
  <a href="/">Home</a>
  <span class="breadcrumb-item"></span>
  <a href="/articles">Articles</a>
</nav>
```

---

**All classes are production-ready and fully documented in `docs/ADVANCED-ENHANCEMENTS-QUICK-START.md`**
