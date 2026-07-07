---
title: Advanced Stylistic Enhancements — Quick Start Guide
authority: reference
status: active
audience: [engineers, designers]
last-updated: 2026-04-09
---

# Advanced Stylistic Enhancements — Quick Start Guide

**Location:** CSS features added to `src/styles/globals.css` (lines 1153-1499, 347 lines)  
**Tailwind Animations:** Updated `tailwind.config.ts` with 8 new keyframe animations  
**Documentation:** `docs/ADVANCED-STYLISTIC-ENHANCEMENTS.md` and `docs/ADVANCED-STYLISTIC-ENHANCEMENTS-SUMMARY.md`

## Available CSS Classes (Copy & Paste)

### Typography Effects
```html
<!-- Animated gradient text -->
<h1 class="text-gradient-animate">
  Animated Headline
</h1>

<!-- Letter-spacing on hover -->
<h2 class="headline-breathe">
  Breathing Headline
</h2>

<!-- Text glow (red or amber) -->
<span class="text-glow-red">Important Text</span>
<span class="text-glow-amber">Premium Feature</span>
```

### Micro-Interactions
```html
<!-- Bouncing icon on hover -->
<button class="icon-bounce">
  <svg><!-- icon --></svg> Click Me
</button>

<!-- Press feedback -->
<button class="btn-press-feedback">
  Press for feedback
</button>

<!-- Tooltip pop animation -->
<div class="tooltip-pop">
  Helpful tooltip
</div>

<!-- Ripple effect on click -->
<button class="ripple">
  Ripple Click
</button>
```

### Modern UI Elements
```html
<!-- Glassmorphism card -->
<div class="card-glass p-6">
  Premium content with blur effect
</div>

<!-- Neumorphic button -->
<button class="btn-neumorphic px-6 py-3">
  3D Button
</button>

<!-- Modern modal -->
<div class="modal-modern p-8">
  Modal content
</div>

<!-- Animated border -->
<div class="card-border-animate">
  Card with animated border
</div>
```

### Background Patterns
```html
<!-- Diagonal lines pattern -->
<section class="pattern-diagonal bg-bmj-black">
  Content with subtle pattern
</section>

<!-- Duotone image effect -->
<div class="duotone">
  <img src="..." alt="..." />
</div>
```

### State Indicators
```html
<!-- Success state -->
<div class="state-success">
  ✓ Success message
</div>

<!-- Error state -->
<div class="state-error">
  ✗ Error message
</div>

<!-- Warning state -->
<div class="state-warning">
  ⚠ Warning message
</div>

<!-- Loading pulse -->
<div class="loading-pulse">
  Loading...
</div>
```

### Progress & Navigation
```html
<!-- Progress bar with CSS variable -->
<div class="progress-bar" style="--progress: 65%"></div>

<!-- Breadcrumb navigation -->
<nav class="flex gap-2">
  <a href="/">Home</a>
  <span class="breadcrumb-item"></span>
  <a href="/articles">Articles</a>
  <span class="breadcrumb-item"></span>
  <span class="breadcrumb-item active">Current</span>
</nav>

<!-- Keyboard focus indicator -->
<button class="keyboard-focused">
  Focus me with Tab
</button>
```

### Responsive Typography
```html
<!-- Fluid hero title -->
<h1 class="hero-title">
  Title scales with viewport
</h1>

<!-- Fluid subtitle -->
<p class="hero-subtitle">
  Subtitle scales fluidly
</p>

<!-- Fluid section headline -->
<h2 class="section-headline">
  Section title scales
</h2>
```

## Real Component Examples

### Example 1: Premium Feature Card
```tsx
export function PremiumFeatureCard() {
  return (
    <div className="card-glass card-border-animate p-8">
      <h3 className="text-gradient-animate mb-4">
        Premium Feature
      </h3>
      <p className="text-bmj-cream/70 mb-6">
        Unlock exclusive content and early access.
      </p>
      <button className="btn-primary icon-bounce">
        Upgrade Now
      </button>
    </div>
  );
}
```

### Example 2: Form with Validation
```tsx
export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  return (
    <form className="space-y-4">
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      
      {error && (
        <div className="state-error">
          {error}
        </div>
      )}
      
      {success && (
        <div className="state-success">
          Logged in successfully!
        </div>
      )}
      
      <button type="submit" className="btn-primary ripple">
        Sign In
      </button>
    </form>
  );
}
```

### Example 3: Breadcrumb Navigation
```tsx
export function Breadcrumbs({ items }) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <Link 
            href={item.href}
            className={cn(
              "nav-link",
              i === items.length - 1 && "breadcrumb-item active"
            )}
          >
            {item.label}
          </Link>
          {i < items.length - 1 && (
            <span className="breadcrumb-item" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
```

### Example 4: Loading Progress
```tsx
export function FileUpload() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  return (
    <div className="space-y-4">
      {status === 'loading' && (
        <div className="progress-bar" style={{ '--progress': `${progress}%` }} />
      )}
      
      {status === 'success' && (
        <div className="state-success">
          File uploaded successfully
        </div>
      )}
      
      {status === 'error' && (
        <div className="state-error">
          Upload failed. Please try again.
        </div>
      )}
    </div>
  );
}
```

### Example 5: Interactive Button with Feedback
```tsx
export function SubscribeButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await subscribe();
      setIsSubscribed(true);
    } catch {
      console.error('Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleClick}
      disabled={isSubscribed || loading}
      className={cn(
        "btn-primary btn-lg icon-bounce",
        isSubscribed && "opacity-50 cursor-not-allowed"
      )}
    >
      {loading && <span className="loading-pulse mr-2">●</span>}
      {isSubscribed ? 'Subscribed' : 'Subscribe Now'}
    </button>
  );
}
```

## CSS Variable Reference

Customize animations by overriding these variables in your component or section:

```css
/* In any component's style prop or CSS module */
:root {
  --text-glow-offset: 10px;           /* Distance of glow */
  --text-glow-blur: 20px;             /* Blur radius */
  --glass-backdrop-blur: 12px;        /* Card blur effect */
  --duration-micro: 150ms;            /* Fast animations */
  --duration-normal: 300ms;           /* Standard animations */
  --duration-slow: 500ms;             /* Slow animations */
}
```

## Testing Checklist

- [ ] Test all animations on mobile (375px)
- [ ] Test all animations on tablet (768px)
- [ ] Test all animations on desktop (1440px)
- [ ] Verify keyboard navigation (Tab through buttons)
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Enable high contrast mode and verify
- [ ] Disable animations (prefers-reduced-motion) and verify fallback
- [ ] Test in Chrome, Firefox, Safari, Edge

## Performance Tips

1. **Use `transform` and `opacity` only** — These are GPU-accelerated
2. **Avoid animating `width/height`** — Use `max-width` instead
3. **Keep animations under 500ms** — Faster is more responsive
4. **Use `will-change` sparingly** — Only on elements that will animate
5. **Test with DevTools** — Check frame rate on Performance tab

## Browser Compatibility

All features work in:
- Chrome/Edge 120+
- Firefox 121+
- Safari 17+
- iOS Safari 17+
- Chrome Android 120+

Fallbacks provided for older browsers (graceful degradation).

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Gradient text not showing | Ensure `-webkit-background-clip` is present (it is) |
| Focus outline invisible | Check contrast (red on black is good, but test in high contrast) |
| Ripple not spreading | Parent must have `overflow: hidden` |
| Animation jerky | Check for `backface-visibility: hidden` on parent |
| Breadcrumb arrows missing | Verify `::before` content is set to "→" |
| Modal too dim | Adjust modal background opacity (currently 0.95) |

## Resources

- Full Spec: [`docs/ADVANCED-STYLISTIC-ENHANCEMENTS.md`](ADVANCED-STYLISTIC-ENHANCEMENTS.md)
- Implementation Guide: [`docs/ADVANCED-STYLISTIC-ENHANCEMENTS-SUMMARY.md`](ADVANCED-STYLISTIC-ENHANCEMENTS-SUMMARY.md)
- CSS Source: `src/styles/globals.css` (lines 1153-1499)
- Tailwind Config: `tailwind.config.ts` (animations section)

---

**Ready to use!** Copy any class from above and add it to your components. All CSS is already included in the global stylesheet.
