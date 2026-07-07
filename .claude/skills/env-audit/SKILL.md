---
description: Cross-check environment variables between code and documentation
context: fork
allowed-tools:
  - Read
  - Grep
  - Glob
---

**Canonical list:** [docs/ops/env-vars.md](../../docs/ops/env-vars.md). **Tiers:** [docs/standards/agent-knowledge-protocol.md](../../docs/standards/agent-knowledge-protocol.md).

Cross-check environment variables between code and documentation. Run these checks:

1. Scan source code for all environment variable references
   - Search `src/` for `process.env.` patterns
   - Build a list of every unique env var name used in code

2. Read the canonical reference at docs/ops/env-vars.md
   - Build a list of every env var documented there

3. Compare the two lists
   - Flag any env var used in code but NOT documented in env-vars.md
   - Flag any env var documented in env-vars.md but NOT referenced in code (may be stale)

4. Verify scope correctness
   - For each `NEXT_PUBLIC_` variable: confirm it is only used in client-safe contexts
   - For each server-only variable: confirm it is NOT referenced in client components

5. Check .env.example (if it exists)
   - Verify it lists all required variables with placeholder values
   - If it doesn't exist, recommend creating one

Report findings as a table:

| Variable | In Code | In Docs | Scope Match | Status |
|----------|---------|---------|-------------|--------|

If everything is consistent:
All environment variables are documented and correctly scoped.
