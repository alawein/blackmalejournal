---
title: BMJ movement literature spec
authority: canonical
status: draft
audience: [designers, editors, agents]
last-verified: 2026-04-20
---

# THE BLACK MALE JOURNAL — Movement Literature Spec

This specification defines the standards for high-stakes presentations, manifestos, and intelligence briefings. It elevates the core BMJ brand into a sophisticated, professional, and visually stunning system for movement-critical documentation.

---

## 1. Typography Hierarchy & Pairings

The hierarchy leverages the sharp contrast between the aggressive, geometric **Highrise** display face and the classic editorial weight of **Libre Baskerville**.

### 1.1 Core Pairings

| Role | Typeface | Style | Case |
|------|----------|-------|------|
| **Primary Display** | Highrise | Bold | ALL-CAPS |
| **Body Text** | Libre Baskerville | Regular/Italic | Sentence |
| **Labels & UI** | Oswald | Medium | ALL-CAPS |
| **Data & Intel** | IBM Plex Mono | Regular | Monospace |

### 1.2 Scaling: Presentation Context (16:9)

Optimized for high-impact, low-density layouts (e.g., Slide Decks).

- **Level 1 Headline (The Incitement):** `text-9xl` (8rem / 128px)
  - Tracking: `var(--tracking-section)` (0.06em)
  - Leading: `leading-none`
- **Level 2 Headline (Section Header):** `text-7xl` (4.5rem / 72px)
  - Tracking: `var(--tracking-display)` (0.04em)
- **Sub-headline / Pull Quote:** `text-4xl` (2.25rem / 36px)
  - Typeface: Libre Baskerville Italic or Highrise
- **Primary Body copy:** `text-2xl` (1.5rem / 24px)
  - Leading: `var(--leading-article)` (1.8)
- **Kickers & Meta:** `text-stamp` (11px)
  - Tracking: `var(--tracking-label-max)` (0.4em)

### 1.3 Scaling: Document Context (A4/Letter)

Optimized for high-density reading and archival storage (e.g., Briefings, Manifestos).

- **Document Title:** `text-6xl` (3.75rem / 60px)
- **Section Heading:** `text-3xl` (1.875rem / 30px)
- **Subsection Heading:** `text-xl` (1.25rem / 20px)
- **Standard Body copy:** `text-lg` (1.125rem / 18px)
- **Captions & Annotations:** `text-sm` (0.875rem / 14px)
- **Security/Intel Markers:** `text-micro` (10px) — IBM Plex Mono

---

## 2. Color Palette & Surface Rules

Adhere to the non-negotiable BMJ palette with sophisticated application layers.

### 2.1 The Canvas
- **Dark Mode (Default):** `--bmj-black` (#0D0C0B) ground.
- **Paper Mode (Alternative):** `--bmj-paper` (#F0DDBC) ground — used for high-contrast briefings or "physical" manifesto effects.
- **Grain:** Always apply the global grain overlay (`--grain-opacity: 0.09`) to remove digital friction.

### 2.2 Pairing Logic
- **Cream on Black:** Primary narrative text (`--bmj-cream` on `--bmj-black`).
- **Red on Black/Cream:** Command elements, call-to-actions, and structural borders (`--bmj-red`).
- **Black on Paper:** High-density reading sections (`--bmj-black` or `--bmj-deep-black` on `--bmj-paper`).
- **Amber Highlights:** Use `--bmj-amber` for critical "pay attention" callouts or pull quotes.

### 2.3 Surface Elevation
- **Panel Strong:** Use `--bmj-deep-black` (#1C130E) for background variations to create depth without using shadows.
- **Command Borders:** All major logical sections must be preceded by a 2px top border in `--bmj-red`.

---

## 3. Layout & Composition

Balance aggressive militant typography with generous white space using a 12-column asymmetric grid.

### 3.1 The Asymmetric Grid
- **Rule of Four:** In a 12-column layout, intentionally leave 4 columns empty (either 2 on each side or a 4-column block on the left/right) to create "ideological breathing room."
- **Typography Alignment:** Left-align all body text for maximal legibility. Headlines may be centered for "Manifesto" style or left-aligned for "Briefing" style.

### 3.2 Key Layout Elements
- **The "Kicker" Stamp:** Every page/slide must have a top-left kicker (Oswald, 11px, 0.4em tracking) identifying the document section or classification level.
- **Star Dividers:** Use `<StarDivider />` for mid-page narrative breaks.
- **Marginalia:** Use the empty grid columns for IBM Plex Mono annotations, page numbers, or "Intel" snippets.

---

## 4. Content Structure Templates

### 4.1 The Manifesto (Persuasive/Visionary)
1. **The Incitement:** Full-screen Highrise headline (3-5 words max).
2. **The Assessment:** Detailed analysis using Libre Baskerville; clear L2 headers.
3. **The Command:** A single, centered pull quote in Highrise or Libre Baskerville Italic.
4. **The Strategy:** 2-column layout; left column for "Objective" (Highrise), right column for "Action" (Baskerville).

### 4.2 The Intelligence Briefing (Informational/Direct)
1. **Classification Header:** IBM Plex Mono "STRICTLY CONFIDENTIAL" / "FOR YOUR EYES ONLY" stamp.
2. **The Brief:** Dense summary with heavy use of `.accent-border-top` to separate topics.
3. **Data Grid:** Tabular data or bulleted lists using IBM Plex Mono for stats.
4. **Conclusion/Next Steps:** Clear, red-bordered box for actionable items.

---

## 5. Visual Language & Image Treatment

- **Halftone/Duotone:** No raw images. Every photograph must be processed with `.duotone` (grayscale + red/cream tint) or `.halftone-dots`.
- **Grain & Noise:** Texture is a sign of lineage. If a surface feels too clean, increase grain density or add a subtle paper texture.
- **Prohibited:** No rounded corners, no gradients, no drop shadows. Every edge is hard, every decision is absolute.
