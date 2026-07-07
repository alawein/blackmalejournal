---
description: Run pre-deployment checklist (TypeScript, lint, build)
context: fork
allowed-tools:
  - Bash(npx tsc *)
  - Bash(npm run lint *)
  - Bash(npm run build *)
  - Read
---

**Tiers / verification:** [docs/standards/agent-knowledge-protocol.md](../../docs/standards/agent-knowledge-protocol.md); CLAUDE.md Testing section for full gate list (includes `verify:docs-links`, `verify:docs-frontmatter` for ops + brand + root `docs/*.md`, and informational `docs:duplicate-audit:ci` in CI).

Run the full pre-deployment checklist in this exact order:

1. Run `npx tsc --noEmit` -- report any TypeScript errors
2. Run `npm run lint` -- report any linting issues
3. Run `npm run build` -- report any build failures

If ALL three pass, output:
All checks passed -- ready to deploy to Vercel.

If ANY fail, output the errors with file paths and line numbers, then suggest fixes.
Do not proceed to the next check if the current one fails -- fix first.
