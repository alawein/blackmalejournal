# THE BLACK MALE JOURNAL — Project Instructions

## What This Project Is
A full-stack website for The Black Male Journal, an independent media house and revolutionary
masculinist platform. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, Supabase,
and Stripe. Deployed on Vercel.

## Quick Start
```bash
npm install
npm run dev          # Development server (Next.js 16)
npm run build        # Production build
npm run lint         # ESLint
npm test             # Jest unit/integration tests
npm run test:e2e     # Playwright E2E tests
npx tsc --noEmit     # TypeScript check
```

## Brand System

Tagline: "Speak the Truth. Navigate the Consequences."
Logo: Journal/book icon with star + pen nib (see `public/logos/` — primary, submark, monogram, b-mark, wordmark variants). Use `src/lib/images.ts` for logo paths.
Aesthetic: Militant print-driven editorial — revolutionary newspapers, political posters.
Full brand spec (colors, fonts, prohibited styles): `.claude/rules/brand.md`
Runtime source of truth: `src/styles/brand.css` — use `var(--bmj-*)` for all colors.

## Lenses (Content Taxonomy)
All articles and content are categorized under exactly one lens:
- health — physical/mental wellness, martial arts, discipline
- politics — power, policy, systems, community organizing
- culture — philosophy, identity, ideology, editorial, cultural analysis
- entertainment — media, technology, reviews
- business — finance, economics, entrepreneurship, career strategy

## Architecture Rules
- App Router only (no pages/ directory)
- All routes under src/app/(public)/ for public pages — includes articles/, briefings/, blog/, records/, video/, academy/, downloads/, handbooks/, about/, contact/, pricing/, search/, support/, privacy/, terms/, etc.
- Auth routes under src/app/(auth)/ — portal (members), login, signup, admin panel
- Admin panel under src/app/(auth)/admin/ — full CRUD for articles, briefings, dispatches, courses, handbooks, downloads, members, subscribers, messages
- `/blog` route intentionally serves Dispatches (not articles) — this is a branding decision, not a naming error
- API routes under src/app/api/
- Components: src/components/ui/ (primitives), /brand/ (logo, headers), /content/ (cards), /home/ (homepage sections), /layout/ (nav, footer), /portal/ (member area), /seo/ (metadata, structured data), /admin/ (admin panel UI), /motion/ (PageTransition, ScrollReveal)
- Content: database-driven via Supabase (articles, briefings, handbooks, downloads, courses, lessons)
- Lib: src/lib/supabase/, src/lib/stripe/, src/lib/content/

## Key Files
- `src/app/layout.tsx` — Root layout, font loading, global providers
- `src/proxy.ts` — Auth proxy (Supabase session handling, route protection)
- `src/lib/supabase/types.ts` — All TypeScript type aliases for DB tables (Article, Briefing, Member, Dispatch, Course, etc.) — check here first when working with content
- `src/lib/supabase/queries.ts` — All database query functions
- `src/lib/supabase/access.ts` — Tier-based content access control
- `src/lib/stripe/config.ts` — Stripe configuration
- `src/lib/paths.ts` — Centralized route path constants — use these instead of hardcoding URL strings
- `src/lib/admin-auth.ts` — Admin session helpers and auth guards
- `src/lib/lens-theme.ts` — LENS_THEMES map (Lens → Tailwind class objects) — use for all lens-based UI styling, never hardcode lens colors inline
- `src/lib/membership.ts` — includesTier() / compareTiers() — always use these for tier access checks, never compare tier strings directly
- `src/styles/brand.css` — CSS custom properties (--bmj-* variables)
- `tailwind.config.ts` — Tailwind theme extending brand tokens
- `supabase/config.toml` — Local Supabase configuration
- `src/lib/seo.ts` — SEO helpers (SITE_URL, structured data builders)
- `src/lib/email.ts` — Transactional email via Resend
- `src/lib/rate-limit.ts` — Request rate limiter for API routes
- `src/lib/storage-assets.ts` — Supabase Storage asset URL helpers
- `src/lib/placeholders.ts` — Centralized placeholder image paths (PLACEHOLDERS constant)

## Image Assets
- **Logo assets:** `public/logos/` — use `LOGOS` from `@/lib/images` for type-safe paths
- **Placeholders:** `public/placeholders/{type}.svg` — use `PLACEHOLDERS` from `@/lib/placeholders`
- **Textures:** `public/textures/` — use `TEXTURES` from `@/lib/images`
- **Image gallery:** `/brand/images` route — visual reference of all assets
- Available placeholder types: article, briefing, course, handbook, dispatch, download, cover (generic)
- When a content card has no `cover_image`, pass `PLACEHOLDERS.{type}` to the `<Image>` src
- Use `IMAGE_SIZES` from `@/lib/images` for responsive image sizing presets

## Code Style
- Use TypeScript strict mode
- Tailwind for all styling — no CSS modules, no styled-components
- Use CSS variables (var(--bmj-*)) for all brand colors in Tailwind config
- Server Components by default, "use client" only when needed
- Zod for all form validation and API input validation
- Use lucide-react for icons
- Framer Motion for page transitions and scroll animations only — keep it subtle

## Content Model
- Articles: title, slug, lens, tags[], excerpt, body, featured, access_tier (free|basic|premium), status (draft|review|scheduled|published|archived|withdrawn), author, cover_image, published_at
- Briefings: issue_number, title, slug, sections (JSON array of {title, body}), access_tier, status (same as Article), cover_image, published_at
- Dispatches: title, slug, body, access_tier, status, published_at — short-form content type; see seed-dispatches.sql
- Members: email, tier (free|basic|premium), role (member|editor|admin), stripe_customer_id, stripe_subscription_id

## Access Tiers
- free: all public articles, briefing previews, video gallery, academy
- basic: full briefing archive, select handbooks, member forum access
- premium: everything — all handbooks, downloads, private content, early access

## File Naming
- Components: PascalCase (ArticleCard.tsx)
- Pages: lowercase with hyphens if needed
- Utilities: camelCase
- Database slugs: kebab-case (e.g., weekend-briefing-001)

## Git Commits
Follow conventional commits: feat:, fix:, chore:, docs:, style:, refactor:, test:
Example: "feat: add Weekend Briefing archive page with lens filter"

## Database (Supabase)
- Migrations: `supabase/migrations/`
- Seed data: `supabase/seed-*.sql` (courses, dispatches, downloads, handbooks, lessons)
- Seed scripts: `scripts/seed.ts` (single table), `scripts/seed-all.ts` (all tables)
- Run seeds: `npx tsx scripts/seed-all.ts`

## Testing
- Run `npm test` — Jest with jsdom (136 suites, 1185 tests)
- Run `npm run test:counts` — prints current suite/test totals for updating `README.md` and this file
- Run `npm run test:watch` — Jest watch mode for development
- Run `npm test -- --coverage` — Coverage report
- Run `npm run test:e2e` — E2E tests with Playwright (chromium)
- Run `npm run verify:docs-links` — relative links under `docs/` resolve (`docs/templates/` skipped)
- Run `npm run verify:docs-frontmatter` — every `docs/ops/*.md`, `docs/brand/*.md`, and root `docs/*.md` handbook has YAML frontmatter with `last-verified` or `last-updated`
- Run `npm run docs:duplicate-audit` — heuristic overlap report for `docs/` (optional; exits 0 unless `--fail`)
- Run `npm run docs:inventory` — print Markdown counts and bucket breakdown (sprawl tracking)
- Verify `npm run build` passes before any commit
- Check TypeScript with `npx tsc --noEmit`
- Run `npm run lint` — ESLint checks
- Visual check: every page must look correct at 375px (mobile) and 1440px (desktop)
- **CI/CD:** GitHub Actions validates all tests + lint + build + docs link check + docs frontmatter (ops, brand, root handbooks) and a short informational duplicate-audit print on every commit and PR

## Important Notes
- When modifying lenses, update all references: `src/lib/supabase/types.ts`, `CLAUDE.md`, `docs/DEVELOPER.md`, `docs/ARCHITECTURE.md`, `src/lib/lens-theme.ts`
- Weekend Briefing is the flagship content format — it gets special design treatment
- The Chairman is the sole author for now — default all author fields to "The Chairman"
- Brand mark (star + pen nib) is used as section dividers via `<StarDivider />` and `<BrandMark />`
- All images should have grain/halftone treatment applied via CSS

## Visual & Animation System

### Beautification Enhancements (10 comprehensive improvements)
1. **Enhanced Animations** — Framer Motion presets, smooth transitions (150-500ms), hover effects
2. **Typography** — Fluid responsive sizing with clamp(), semantic classes (`.page-title`, `.card-title`, etc.)
3. **Depth Effects** — Multi-layer shadows (elevation scale), glow effects, glass backdrop effects
4. **Button Consistency** — 5 button variants (primary, secondary, ghost, amber, outline) with unified behavior
5. **Navigation** — Underline animations, filter tabs, filter chips with smooth transitions
6. **Accessibility** — `:focus-visible` red outline, screen reader text (`.sr-only`), `prefers-reduced-motion` support
7. **Responsive Design** — Mobile-first with 48px+ touch targets, 3 breakpoints (mobile/tablet/desktop)
8. **Image Optimization** — Halftone filters, duotone effects, responsive grids, lazy loading
9. **Depth & Dimension** — Z-index scale, card lift effects, shadow layering, border glow
10. **Responsive Typography** — Heading sizes adapt via clamp() from mobile to desktop

### Animation Utilities
- `src/lib/animations.ts` — Framer Motion presets and Tailwind animation classes
- Classes: `.transition-smooth`, `.transition-micro`, `.transition-dramatic`, `.hover-lift`, `.hover-scale`
- Framer Motion variants: `pageTransition`, `fadeInUp`, `slideInRight`, `staggerContainer`

### Typography System
- Semantic classes: `.page-title`, `.section-title`, `.card-title`, `.editorial-kicker`, `.lead-text`, `.body-text`, `.quote-text`
- All headings use `clamp()` for fluid responsive sizing
- Letter-spacing varies per hierarchy level
- Text shadows on headings for visual depth

### Shadow & Depth
- Shadow tokens: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`, `--shadow-card`, `--shadow-glow-red`, `--shadow-glow-amber`
- Card variants: `.card-media` (3px top), `.card-stripe` (4px left), `.card-feature` (1px uniform), `.card-offer` (gradient)
- Surfaces: `.surface-panel`, `.surface-panel-strong`, `.surface-elevated`, `.surface-glass`

### Button System
- Variants: `.btn-primary` (red), `.btn-secondary` (ghost red), `.btn-ghost` (outline), `.btn-amber` (premium), `.btn-outline`
- Sizes: `.btn-xs`, `.btn-sm`, `.btn-lg`, `.btn-xl`
- Icon buttons: `.btn-icon`, `.btn-icon-square`
- All buttons have unified hover (lift + shadow increase) and active (scale 0.98) states

### Responsive & Accessibility
- Breakpoints: Mobile (<641px), Tablet (641-1024px), Desktop (>1025px)
- Touch-friendly: 48px minimum on mobile via `@media (hover: none) and (pointer: coarse)`
- Focus rings: Red `:focus-visible` outline with 2px offset
- Motion: Automatically disabled for `prefers-reduced-motion: reduce`
- Screen reader: `.sr-only` for hidden text
- High contrast mode: 3px outline, thicker borders

### Advanced Stylistic Enhancements

Beyond the 10 core beautification improvements, advanced CSS features for premium visual appeal:

**Dynamic Typography Effects:**
- `.text-gradient-animate` — Animated gradient text for hero headlines (shifts through red, amber, white)
- `.headline-breathe` — Letter-spacing animation on hover (0.1em expand)
- `.text-glow-red` / `.text-glow-amber` — Text shadow glow effects for emphasis

**Advanced Micro-Interactions:**
- `.icon-bounce` — Bouncing icon animation (8px lift on hover)
- `.btn-press-feedback` — Press feedback with scale (0.95) and inset shadow
- `.tooltip-pop` — Pop-in animation with cubic-bezier easing
- `.ripple` — Material Design ripple effect on click (300px spread)

**Modern UI Elements:**
- `.card-glass` — Glassmorphism with 12px backdrop blur, refined border
- `.btn-neumorphic` — Subtle 3D neumorphic effect with dual shadow
- `.modal-modern` — Gradient modal background with refined border
- `.card-border-animate` — Animated rotating gradient border (3s duration)

**Background Patterns:**
- `.pattern-diagonal` — Subtle 45° diagonal lines (35px spacing, 2% opacity)
- `.duotone` — Color overlay for magazine-style effect (multiply blend)

**State & Feedback Indicators:**
- `.state-success` / `.state-error` / `.state-warning` — Colored left border with background tint
- `.loading-pulse` — Pulse animation (1.5s, 0.5-1 opacity)
- `.progress-bar` — Animated gradient progress (red→amber) with smooth width transition
- `.progress-shimmer` — Shimmer animation on progress bar

**Navigation Visual Cues:**
- `.breadcrumb-item` — Navigation breadcrumbs with arrows (→) between items
- `.breadcrumb-item.active` — Bold white highlight for current breadcrumb
- `.keyboard-focused` — Keyboard navigation indicator (red left border)

**Responsive Typography:**
- `.hero-title` — Fluid heading: clamp(2rem, 8vw + 1rem, 5rem)
- `.hero-subtitle` — Fluid subtitle: clamp(1rem, 4vw + 0.5rem, 2rem)
- `.section-headline` — Fluid section: clamp(1.5rem, 5vw + 0.5rem, 3rem)

**New Tailwind Animations:**
- `gradientShift` — 6s background position shift for gradient text
- `bounce` — Icon bounce (8px amplitude, 600ms)
- `tooltipPop` — Pop-in with scale (0.8 → 1)
- `rippleEffect` — Ripple spread (0 → 300px diameter)
- `borderShift` — Rotating hue animation (0 → 360°)
- `loadingPulse` — Opacity pulse (0.5 → 1)

**High Contrast & Accessibility:**
- `@media (prefers-contrast: more)` — Thicker borders, enhanced shadows
- `:focus-visible` — 3px red outline with 4px offset
- High contrast fonts (500+ weight boost)

---

### Documentation Links

**See also:** `docs/brand/` for visual identity, art direction, and palette references.

BMJ has no runtime dependency on any external shared token package. Do not adopt a shared external token package unless a new ADR is approved with: (1) an explicit architectural decision, (2) proof that every BMJ token maps exactly without visual drift, and (3) updated tests and docs showing the migration is fully independent. A previous proposal to use a shared package was rejected because the vendored subtree was not a runtime dependency and leaked into repository maintenance.

## Route Rename Checklist
When renaming a public route (e.g., /library → /records), update all 5 locations:
1. `src/app/(public)/<old>/` → rename directory to `<new>/`
2. `src/lib/paths.ts` — add or update `PATHS` entries; `src/lib/nav.ts` should use `PATHS` for `href` values
3. `src/app/sitemap.ts` — update static URL entry (prefer `PATHS` constants)
4. `src/app/not-found.tsx` — update fallback link if it points to the route
5. `tests/` — grep for old label text and old href strings in component/nav/sitemap tests

## Gotchas
- Bash commands with App Router paths (parentheses, brackets) require double quotes: `git add "src/app/(public)/briefings/[slug]/page.tsx"` — unquoted `(` and `[` cause shell syntax errors.
- After renaming any `src/app/` directory, run `rm -rf .next` before `npx tsc --noEmit` — stale type artifacts in `.next/types/validator.ts` will report `Cannot find module` for the old path.
- `tailwind.config.ts` hardcodes hex color values — do NOT replace with `var(--bmj-*)`. Tailwind opacity modifiers (`bg-bmj-red/10`, `text-bmj-cream/80`) require decomposable hex, not CSS variables. The `.claude/hooks/drift-detection.sh` hook guards against the two files diverging.
- On Windows, `pkill` and `taskkill /F /IM node.exe` do not reliably kill the Next.js dev server. Use: `powershell -Command "Get-Process node"` to find the PID, then `powershell -Command "Stop-Process -Id <PID> -Force"`.

## Documentation
- BMJ comprehensive documentation SSOT (share this): docs/BMJ-SSOT.md
- Architecture and system design: docs/ARCHITECTURE.md
- Contributing guide (code style, PR process, naming): docs/CONTRIBUTING.md
- Troubleshooting common issues: docs/TROUBLESHOOTING.md
- Developer setup: docs/DEVELOPER.md
- Operations: docs/ops/ (chairman reference, SOPs, env vars)
- Agent knowledge protocol: docs/standards/agent-knowledge-protocol.md

## Operations & Infrastructure
- Environment variable reference: docs/ops/env-vars.md (canonical source of truth)
- When adding a new environment variable: add it to docs/ops/env-vars.md first, then set it in Vercel
- Never commit .env files, API keys, or credentials — .gitignore must cover .env*
- Only NEXT_PUBLIC_ prefix for values safe to expose in client bundles (Supabase URL/anon key, site URL, WhatsApp link, Plausible domain)
- Server-only secrets (Stripe secret key, Supabase service role key, Resend key) must NEVER have NEXT_PUBLIC_ prefix
- Org accounts use founder@ or role aliases on the org domain — never personal email for service accounts
- Run /secrets-audit before deploys, /backup-check weekly, /env-audit after adding new integrations
- Run /domain-setup once when the custom domain is purchased (consolidates all domain-dependent tasks)
