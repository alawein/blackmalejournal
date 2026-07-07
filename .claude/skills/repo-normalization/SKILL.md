---
name: repo-normalization
description: Use when the repo feels cluttered, files seem duplicated, directories have overlapping purpose, or tracked build artifacts need cleanup. Triggers on "clean up", "audit structure", "normalize", "deduplicate", "prune".
---

# Repository Normalization

Audit and clean the repo so every file has exactly one reason to exist, in exactly one place.

## Doc context (Tier A/B)

[AGENTS.md](../../AGENTS.md), [CLAUDE.md](../../CLAUDE.md), [docs/standards/agent-knowledge-protocol.md](../../docs/standards/agent-knowledge-protocol.md) (anti-fragmentation, INDEX rules). **Task-scoped:** [docs/CONTRIBUTING.md](../../docs/CONTRIBUTING.md) (layout, naming); `npm run docs:inventory` for doc counts.

## Operations (apply in order)

### 1. Deduplicate
Find directories/files with overlapping purpose:
- `scripts/` + `_scripts/`, `utils/` + `helpers/`, `types/` + `interfaces/`
- Duplicate README variants, lockfiles, env templates
- Artifact snapshots superseded by live content

### 2. Colocate
Move files next to the code they serve. A file should not live in a catch-all location when it belongs to a specific domain.

### 3. Eliminate Dead Weight
- Empty directories
- Orphaned components (zero imports outside their own test)
- Stale archives (`.zip`, `.bak`, superseded snapshots)
- Outdated handoff files (`NOTES_old.md`, `TODO_2021.txt`)

### 4. Prune Theater
Remove scripts/configs that appear active but do nothing:
- CI workflows that just `echo "ok"`
- Lint configs never invoked
- Pre-commit hooks that are no-ops

### 5. Inline Where Appropriate
- Tiny mapping files → table in central config
- Single-entry allowlists → inline comment
- Micro JSON configs (1-3 keys) → merge into parent

## Verification Checklist

| Check | Command |
|-------|---------|
| No broken imports | `npx tsc --noEmit` |
| Tests pass | `npm test -- --ci` |
| Build succeeds | `npm run build` |
| No refs to deleted files | `grep -r "<deleted-filename>" src/ tests/` |

## Rules

- Flag ambiguous cases before touching them
- Never silently delete — list every removal with justification
- If a directory holds one file, consider promoting the file up one level
- Produce a before/after structural diff
- Git-tracked build artifacts (coverage/, test-results/) should be gitignored, not tracked
