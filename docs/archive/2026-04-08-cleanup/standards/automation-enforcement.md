---
title: Automation and Enforcement
audience: [platform, devops]
status: canonical
last-updated: 2026-03-31
---

# Automation and Enforcement

**Principle:** Start **informational → warning → required** to avoid blocking teams during adoption.

---

## 1. Repository templates (GitHub)

| What it checks | N/A — seeds correct structure |
| Where | New repo creation |
| Initial strictness | N/A |
| Remediation | Use template for new repos; existing repos get scaffold PR |

**Includes:** README skeleton, CONTRIBUTING, SECURITY, `.github` templates, `.editorconfig`, `service.yaml` stub.

---

## 2. Scaffolding / generators

| What it checks | Validates generated tree matches policy |
| Where | Local CLI + optional CI on `init` PR |
| Initial strictness | Warn if manual repo skips generator |
| Remediation | Run `eng repo init` (example name) or copy `docs/templates/` |

---

## 3. Linters (docs + metadata)

| What it checks | Required headings in README; `service.yaml` schema; ADR filename pattern |
| Where | PR checks (`markdownlint`, custom YAML schema validator) |
| Initial strictness | **Warn** month 1–2 → **Block** on new files |
| Remediation | Fix lint or add exception with ID in file header |

**Example checks:**

- README has `## Quickstart` (or team alias documented once)
- `service.yaml` validates against JSON Schema in `platform-schemas` repo

---

## 4. GitHub Actions (CI governance)

| What it checks | Required workflows exist; `ci.yml` runs on `pull_request` |
| Where | Org-level reusable workflow **called by** repo workflow, or org ruleset |
| Initial strictness | Report missing workflow; do not block until week 6 of pilot |
| Remediation | Add `uses: org/.github/.github/workflows/ci-governance.yml@main` |

---

## 5. Policy-as-code

| What it checks | Branch protection ruleset; required workflows; allowed actions |
| Where | GitHub Organization Rulesets + OPA/Conftest on policy repo **or** custom org app |
| Initial strictness | Audit mode → enforce |
| Remediation | Fix in GitHub settings with platform approval |

**Examples:** Require “ci” check context; disallow force-push; require linear history optional.

---

## 6. Scheduled audits

| What it checks | Full org inventory: metadata completeness, stale repos, alert age |
| Where | Weekly GitHub Action in `platform-governance` repo + BigQuery export |
| Initial strictness | Issue opened automatically; no block |
| Remediation | Owner assigned via CODEOWNERS; SLA to close audit issue |

---

## 7. Bots: dependencies and stale management

| **Dependabot / Renovate** |
| What | Outdated deps, grouped updates, lockfile refresh |
| Where | Repo config + org defaults |
| Strictness | **Info** → auto-merge patch (optional) → block critical CVE |
| Remediation | Merge bot PR or pin with justification |

| **Stale bot** |
| What | Issues/PRs with no activity |
| Where | Scheduled workflow |
| Strictness | Label → close with comment |
| Remediation | Comment `/keep-open` or update |

---

## 8. Scorecards / compliance dashboards

| What it checks | Composite score from [migration-framework scorecard](./migration-framework.md) |
| Where | Internal dashboard (Looker, Grafana, Hex) fed by nightly ETL |
| Initial strictness | Visibility only |
| Remediation | Team backlog from lowest-scoring dimensions |

---

## Severity ramp (suggested timeline)

| Week | Org posture |
|------|-------------|
| 0–4 | Templates + **informational** checks |
| 5–8 | **Warning** on PR for missing SECURITY, CODEOWNERS |
| 9–12 | **Required** check for `governance-lite` (schema + file presence) on **new** repos |
| 13+ | Expand **required** to P0 service list; prototypes exempt |

---

## Remediation ownership

| Failure | Owner | Escalation |
|---------|-------|------------|
| Missing metadata | Repo team | EM if >14 days |
| Broken governance workflow | Platform | SRE if org-wide |
| False positive | Platform | Disable rule + ticket |
