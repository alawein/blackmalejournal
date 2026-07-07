---
title: Documentation Standards and Quality Rubric
audience: [all-engineers, tech-writers]
status: canonical
last-updated: 2026-03-31
---

# Documentation Standards

## Principles

1. **Discoverable** — Index from README → `docs/README.md` → specific doc.
2. **Accurate** — Last-reviewed date on operational docs (recommended).
3. **Actionable** — Steps, commands, and failure modes—not essays.
4. **Scoped** — Separate “getting started” from “deep architecture.”

**Agents and AI context:** Tiered reading (A–D), conflict resolution when sources disagree, and sprawl controls are defined in [agent-knowledge-protocol.md](agent-knowledge-protocol.md). **Ops, brand, and root `docs/*.md` frontmatter** is enforced in CI (`npm run verify:docs-frontmatter`); CI prints a short duplicate-audit sample (`docs:duplicate-audit:ci`); full heuristic: `npm run docs:duplicate-audit`. See [CONTRIBUTING.md](../CONTRIBUTING.md) (Documentation frontmatter).

---

## Required README structure

| Section | Required | Content |
|---------|----------|---------|
| Title + one-liner | Yes | What the repo is for |
| Status | Yes for non-standard | Production / prototype / deprecated |
| Ownership | Yes | Team, Slack/channel, CODEOWNERS pointer |
| Quickstart | Yes | Clone, install, run, test (copy-paste blocks) |
| Links | Yes | `docs/`, runbooks, API docs, dashboard links |
| Security | Yes | Link to `SECURITY.md` |
| License | Yes | File or pointer |

---

## Local development setup (`docs/setup.md` or README subsection)

| Element | Required |
|---------|----------|
| Prerequisites (runtime, tools, versions) | Yes |
| Environment variables (see `.env.example`) | Yes for apps |
| Common failures + fixes | Recommended |
| IDE / editor tips | Optional |

---

## Deployment and release (`docs/deploy.md` or platform link)

| Element | Required |
|---------|----------|
| Where artifacts are built | Yes |
| How promotion works (dev → staging → prod) | Yes |
| Who can deploy / approval model | Yes |
| Rollback procedure or link | Yes for services |

---

## Operational runbooks (`docs/runbooks/`)

| Element | Required |
|---------|----------|
| Symptom → diagnostic steps | Yes |
| Mitigation / rollback | Yes |
| Escalation (when to page, who) | Yes |
| Links to dashboards and logs | Yes |
| Last reviewed date | Recommended |

---

## Architecture overview (`docs/architecture.md`)

| Element | Required |
|---------|----------|
| Context diagram or bounded context description | Recommended |
| Dependencies on other systems | Yes for services |
| Data stores and trust boundaries | Yes when handling sensitive data |
| ADR index link | Recommended |

---

## Troubleshooting (`docs/troubleshooting.md` or FAQ)

| Element | Required |
|---------|----------|
| Top 5 recurring issues | Recommended |
| Debug logging / trace IDs | Recommended for services |

---

## On-call / support expectations

Document in README or `docs/support.md`:

| Field | Example |
|-------|---------|
| Hours | 24/7 vs business hours |
| Channel | `#team-foo` |
| Severity definitions | P0–P3 |
| External comms | Who updates status page |

---

## API / service contracts

| Artifact | When |
|----------|------|
| OpenAPI / GraphQL schema in repo or registry | Services with external API |
| Consumer-driven contract tests | Recommended for critical integrations |
| Versioning and deprecation policy | Public or cross-team APIs |

---

## Dependency and compatibility notes

| Content | Library | App/Service |
|---------|---------|-------------|
| Supported language/runtime versions table | Yes | Yes |
| Breaking change policy | Yes | As needed |
| Upgrade playbook | Recommended | Recommended |

---

## Documentation quality rubric

Score each dimension **1–4** and average for an overall tier, or use **minimum** dimension as floor.

### Dimensions

| Dimension | Poor (1) | Acceptable (2) | Strong (3) | Exemplary (4) |
|-----------|----------|------------------|------------|---------------|
| **Completeness** | Missing setup or ownership | Core paths documented; gaps in edge cases | All primary flows documented | Edge cases, diagrams, clear boundaries |
| **Accuracy** | Wrong commands / broken links | Mostly works; occasional drift | Verified recently; links work | Automated checks or scheduled review with owners |
| **Freshness** | Stale &gt;12 months | Stale 6–12m with “may be outdated” | Reviewed ≤6m or on-change | CI/docs lint or ownership rotation |
| **Discoverability** | README is wall of text | README + docs index | Clear nav, search-friendly headings | Cross-links from related services |
| **Operational usability** | No runbook / wrong escalation | Runbook exists; thin on failure modes | Step-by-step with dashboards | Game days updated docs; MTTR evidence |

### Overall levels

| Level | Definition |
|-------|------------|
| **Poor** | Any critical path undocumented OR misleading; onboarding blocked |
| **Acceptable** | New hire can run locally with &lt;1 day help; ops path exists but thin |
| **Strong** | Self-service onboarding; runbooks actionable; known gaps listed |
| **Exemplary** | Measurable onboarding time; docs tested in CI or drills; continuous improvement |

### Review cadence

- **Services:** Architecture + runbook **quarterly** spot check (sample).
- **Libraries:** Compatibility section on **major** release.
- **All:** After **incidents**, update docs within **5 business days** (recommended SLO).
