---
title: Agent and contributor knowledge protocol
audience: [agents, contributors]
status: canonical
last-verified: 2026-04-09
---

# Agent and contributor knowledge protocol

BMJ keeps many Markdown files under `docs/` and agent-oriented files under `.claude/`. **Sprawl risk** is not file count alone—it is unclear authority (what is current vs historical), duplicate narratives, and unbounded context loading. This page defines **reading tiers**, **conflict order**, and **anti-patterns** so humans and agents load the right sources.

**Related:** [AGENTS.md](../../AGENTS.md) (normative governance), [README.md](../README.md) (docs map). **Inventory:** `npm run docs:inventory`.

---

## Tier A — Boot (default context)

Load these before structural or cross-cutting work:

| File | Role |
|------|------|
| [AGENTS.md](../../AGENTS.md) | Normative scope, invariants, authority table |
| [CLAUDE.md](../../CLAUDE.md) | Day-to-day engineering instructions, key paths, validation commands |
| [BMJ-SSOT.md](../BMJ-SSOT.md) | **Single comprehensive documentation SSOT** — program, roadmap, repo map (share externally) |
| [README.md](../README.md) | Map of `docs/` lanes and primary entry points |

**Protocol:** Do not skip Tier A for tasks that touch architecture, brand, env vars, or governance.

---

## Tier B — Domain SSOT (task-scoped)

Open **only** what the task needs. Examples:

| Domain | Canonical docs |
|--------|----------------|
| Environment variables | [ops/env-vars.md](../ops/env-vars.md) |
| Brand law (visual) | [brand/invariants.md](../brand/invariants.md), [brand/visual-ssot.md](../brand/visual-ssot.md); runtime tokens: `src/styles/brand.css` |
| Chairman-facing consistency (domains, emails, handles) | [ops/chairman-consistency-reference.md](../ops/chairman-consistency-reference.md) |
| Comprehensive documentation SSOT | [BMJ-SSOT.md](../BMJ-SSOT.md) |
| System design | [ARCHITECTURE.md](../ARCHITECTURE.md), [DEVELOPER.md](../DEVELOPER.md) |

**Protocol:** Prefer **one SSOT chain** per concern (e.g. brand: invariants → visual-ssot → code). Do not duplicate long excerpts into prompts—**link paths** and read the file.

---

## Tier C — Execution artifacts

Dated plans, specs, audits:

- `docs/audits/` (current); treat as **work tracking** and evidence, not replacement for Tier B

**Protocol:** Load Tier C **only when** the task explicitly matches that plan/audit.

---

## Tier D — Archive and mirrored SSOT

- `docs/audits/archive/`
- `docs/archive/` (historical artifacts from documentation cleanups)

**Protocol:** **Non-authoritative** for “what is true now” unless you are reconciling history. Always cross-check Tier B and code before acting. See **Anti-archive-poisoning** below.

---

## Conflict resolution order

When two sources disagree, resolve in this order (highest wins):

1. [AGENTS.md](../../AGENTS.md) (normative)
2. Per-domain SSOT named in AGENTS / this file (e.g. `env-vars.md`, `brand.css`, `invariants.md`)
3. [CLAUDE.md](../../CLAUDE.md)
4. Lane READMEs and other `docs/` handbooks
5. Tier C plans and specs
6. Tier D archive

Prefer the document with **newer `last-verified` or `last-updated`** frontmatter when authority is otherwise equal. Record intentional overrides in the PR description or handoff.

---

## Anti-sprawl and related controls

| Anti | Control |
|------|---------|
| **Anti-context-loss** | Default stack = Tier A + task-scoped Tier B; add C/D only with cause. |
| **Anti-hallucination** | Ground claims in repo paths and code; cite files in PRs and agent outputs. |
| **Anti-drift** | `last-verified` / `last-updated` on SSOT docs; CI link check (`verify:docs-links`); brand token hooks per CLAUDE.md. |
| **Anti-redundancy** | One narrative per concern; link SSOT instead of copying tables; run `docs:duplicate-audit` when adding large docs. |
| **Anti-staleness** | Timebox dated plans; fold outcomes into `BMJ-SSOT.md` or audits; quarterly pass on Tier A/B. |
| **Anti-fragmentation** | New lanes or large plans get one row in [README.md](../README.md). |
| **Anti-noise** | Do not load multi-hundred-line plans unless implementing that plan. |
| **Anti-bias (retrieval)** | Apply conflict order; do not treat the longest doc as most true. |
| **Anti-folksonomy** | Follow [CONTRIBUTING.md](../CONTRIBUTING.md) — doc naming and lane folders. |
| **Anti-authority-creep** | AGENTS.md and SSOT changes need explicit review. |
| **Anti-archive-poisoning** | Never treat `docs/archive/*` as current truth without Tier B check. |
| **Anti-prompt-drift** | Keep `.claude/skills/*/SKILL.md` short; point to Tier B docs for depth. |

---

## Near-duplicate audit (anti-redundancy)

Heuristic scan for overlapping prose (shared vocabulary) between pairs of files under `docs/`. **Not** a judgment of intent: plan + spec pairs and index + README often score high by design.

```bash
npm run docs:duplicate-audit
```

Flags tune sensitivity: `--min-jaccard=0.2`, `--min-containment=0.5`, `--min-words=120`, `--max-report=40`. Optional gate: `--fail` with `--fail-jaccard` / `--fail-containment` (fails CI if any pair exceeds stricter thresholds). Default run exits 0. **CI:** `npm run docs:duplicate-audit:ci` prints the top five pairs only (informational; does not fail the build).

---

## Living inventory

Run from repository root:

```bash
npm run docs:inventory
```

Counts all `.md` files (with bucket breakdown) and `docs/brand/*.html`. Numbers change as the repo grows; the command is the source of truth, not a hard-coded total in prose.
