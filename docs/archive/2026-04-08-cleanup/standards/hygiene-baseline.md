---
title: Codebase Hygiene Baseline
audience: [all-engineers, security]
status: canonical
last-updated: 2026-03-31
---

# Codebase Hygiene Baseline

Legend: **Baseline** = mandatory org-wide (non-archived). **Recommended** = adopt by maturity; may become baseline later.

---

## Naming conventions

| Area | Baseline | Recommended |
|------|----------|-------------|
| Repo name | `kebab-case`; product/domain prefix optional (`payments-api`) | Domain bounded names matching service catalog |
| Default branch | `main` | Protected; no direct pushes |
| Branches | `feat/`, `fix/`, `chore/` prefixes | Conventional commits for changelog automation |
| Tags | `v*` semver for libraries | Signed tags for releases |

---

## Repository layout

| Rule | Baseline | Recommended |
|------|----------|-------------|
| Single primary source tree | Document root (`src/`, `app/`, `lib/`) | `docs/` for long-form |
| Tests discoverable | Document convention in README | Single command runs all tests |
| Generated code | Not committed **or** committed with clear banner + regen script | CI checks regeneration |

---

## Branch protections

| Control | Baseline | Recommended |
|---------|----------|-------------|
| No force-push to `main` | Yes | — |
| PR required | Yes | — |
| Required reviewers | ≥1 via CODEOWNERS | 2 for high-tier services |
| Required status checks | CI (lint+test minimum) | Merge queue / merge group |
| Signed commits | Org policy | Yes for release tags |
| Stale branch cleanup | — | Quarterly bot |

---

## Required status checks

| Check | Baseline | Recommended |
|-------|----------|-------------|
| Lint | Yes (language-appropriate) | Shared config for stack |
| Unit tests | Yes | Flaky test quarantine process |
| Secret scanning | Yes (GitHub Advanced Security or equivalent) | Custom patterns for org tokens |
| Dependency review | Warn on PR | Block on critical CVEs (policy-defined) |
| License compliance | — | FOSSA / SBOM for releases |

---

## Test coverage expectations

| Repo type | Baseline | Recommended |
|-----------|----------|-------------|
| Library | No org-wide % floor initially; tests required | ≥80% for new code in critical modules |
| Service | Critical paths tested; integration tests for deploy path | Contract tests for external API |
| Frontend | Smoke + unit baseline | E2E for critical journeys |
| Prototype | Best effort | — |

*Baseline rule:* **No merging** if existing tests are deleted without replacement and owner approval.

---

## Linting and formatting

| Rule | Baseline | Recommended |
|------|----------|-------------|
| Formatter in CI | Yes (or `fmt --check`) | Shared Prettier / Ruff / gofmt config |
| Linter in CI | Yes | Gradual strictness; no silent `eslint-disable` without ticket |

---

## Secret handling

| Rule | Baseline | Recommended |
|------|----------|-------------|
| No secrets in git | Yes; scanning blocks | git-secrets / pre-commit hooks |
| `.env` gitignored | Yes | `.env.example` only |
| CI secrets | Platform vault only | Rotation runbooks |

---

## Dependency management

| Rule | Baseline | Recommended |
|------|----------|-------------|
| Lockfile committed | Yes where ecosystem standard | Pin transitive for apps |
| Bot PRs | Dependabot or Renovate | Grouped updates weekly |
| CVE SLA | Security policy defines P0/P1 patch windows | Auto-PR for patch minors |

---

## Archive / deprecation

| Rule | Baseline | Recommended |
|------|----------|-------------|
| README banner + successor link | Yes before archive | |
| GitHub archive mode | Yes | Disable workflows |
| Package deprecation | npm/PyPI deprecation notice | Timeline for removal |

---

## Stale repository handling

| Signal | Action |
|--------|--------|
| No commits **12 months** | Owner ping; classify archive vs active |
| Open PRs **90+ days** | Bot reminder or auto-close policy |
| No CODEOWNERS match | Platform escalation |

---

## Versioning conventions

| Artifact | Convention |
|----------|------------|
| Libraries | Semver; breaking = major |
| Apps / services | Calver or build ID + semver for API surface |
| Infra modules | Semver for reusable modules |

---

## Ownership and escalation metadata

| Field | Baseline |
|-------|----------|
| Owning team | Required |
| Primary Slack/Teams channel | Required |
| Pager / on-call ID (services) | Required |
| Escalation (manager / secondary) | Recommended |
| Service tier (0–3) | Recommended |

---

## Summary: minimum vs recommended

| Topic | Minimum baseline | Best practice |
|-------|------------------|---------------|
| Branch protection | PR + checks + no force push | Merge queue, signed commits |
| Tests | Must pass; no gratuitous deletion | Coverage targets by risk |
| Docs | README + ownership + SECURITY | Full runbook + ADRs |
| Dependencies | Bot + review | SLA + grouped updates |
| Metadata | CODEOWNERS + service.yaml | Service catalog integration |
