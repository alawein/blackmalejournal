---
description: Audit all code for brand compliance (colors, fonts, prohibited styles)
context: fork
allowed-tools:
  - Read
  - Grep
  - Glob
---

**Canonical docs:** [docs/brand/invariants.md](../../docs/brand/invariants.md), [docs/brand/visual-ssot.md](../../docs/brand/visual-ssot.md), `src/styles/brand.css`, `.claude/rules/brand.md`. **Tiers:** [docs/standards/agent-knowledge-protocol.md](../../docs/standards/agent-knowledge-protocol.md).

Audit the entire project for brand compliance. Reference .claude/rules/brand.md for the full spec.

1. Search all .tsx, .css, and .ts files for hex color codes
   - Flag any color that is NOT one of the --bmj-* values
   - Flag any hardcoded hex instead of using var(--bmj-*)

2. Check font usage
   - Verify only Highrise, Libre Baskerville, Oswald, and IBM Plex Mono are referenced
   - Flag any other font families

3. Check for prohibited styles
   - No border-radius larger than 4px (no pill shapes, no rounded-xl)
   - No drop shadows or box-shadows (except subtle 1px borders)
   - No gradients (no bg-gradient-*)
   - No glassmorphism (no backdrop-blur)

4. Verify grain texture overlay is applied to main layout

Report all violations with file paths and line numbers.
