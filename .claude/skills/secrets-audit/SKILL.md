---
description: Audit project for leaked secrets, credentials, and unsafe env var exposure
context: fork
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git ls-files *)
  - Bash(git log *)
---

**Tier B:** [docs/ops/env-vars.md](../../docs/ops/env-vars.md) (what may be `NEXT_PUBLIC_`). **Tiers:** [docs/standards/agent-knowledge-protocol.md](../../docs/standards/agent-knowledge-protocol.md).

Audit the project for secrets safety. Run these checks in order:

1. Verify no secrets are tracked in git
   - Run: `git ls-files | grep -iE "\.env|secret|credential|\.pem|\.key"`
   - Expected: No matches

2. Verify .gitignore covers all sensitive patterns
   - Read `.gitignore` and confirm it includes: `.env*`, `.env.local`, `node_modules`, `.next/`, `.vercel`
   - Flag any missing entries

3. Verify no hardcoded secrets in source code
   - Search `src/` for patterns: `sk_live_`, `sk_test_`, `whsec_`, `eyJ`, `re_` (long string), `sbp_`
   - Expected: No matches

4. Verify NEXT_PUBLIC_ prefix correctness
   - Search `src/` for all `process.env.NEXT_PUBLIC_` references
   - Only these should be client-exposed: SUPABASE_URL, SUPABASE_ANON_KEY, SITE_URL, WHATSAPP_LINK
   - Flag any server-only variable with NEXT_PUBLIC_ prefix

5. Verify no secrets in recent commits
   - Run: `git log --diff-filter=A --name-only -20`
   - Flag any .env, credential, or key files that were committed

Report all findings with file paths and line numbers. If everything passes:
All checks passed -- no secrets exposed.
