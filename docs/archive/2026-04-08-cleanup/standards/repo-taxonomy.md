---
title: Repository Taxonomy and Standards Matrix
audience: [platform, teams]
status: canonical
last-updated: 2026-03-31
---

# Repository Taxonomy

This matrix defines **which standards apply** to each repository category. **M** = mandatory baseline, **R** = recommended, **—** = not required (still must meet org-wide security minimums unless noted).

**Global minimums (all non-archived repos):** `README.md`, `CODEOWNERS`, `SECURITY.md`, `.github` PR template, secret scanning enabled, branch protection on default branch, dependency update automation configured.

---

## Category definitions

| Category | Description | Typical signals |
|----------|-------------|-----------------|
| **Service** | Long-running backend serving production traffic | Deployable artifact, SLO, on-call |
| **Library** | Published package consumed by other repos | semver, registry publish |
| **Frontend app** | User-facing web/mobile shell | build pipeline, asset budget |
| **Infrastructure / IaC** | Terraform, Pulumi, K8s manifests | plan/apply, drift detection |
| **Data** | Pipelines, notebooks, warehouse jobs | data classification, PII handling |
| **Monorepo** | Multiple packages/services in one repo | workspace tooling, ownership per path |
| **Prototype / spike** | Time-boxed experiment | explicit expiry date in README |
| **Archived** | Read-only historical | branch protection, archive banner |

---

## Standards matrix

| Standard | Service | Library | Frontend | Infra | Data | Monorepo | Prototype | Archived |
|----------|---------|---------|----------|-------|------|----------|-----------|----------|
| `service.yaml` metadata | M | R | M | M | M | M (root + per package) | O | — |
| `docs/runbooks/` | M | — | R | M | M | M (critical paths) | — | — |
| `docs/adr/` | R | O | R | R | R | R | — | — |
| `CHANGELOG` / release notes | R | M | R | R | R | R | — | — |
| Contract tests / API schema | R | M (API libs) | R | — | R | R | — | — |
| `.env.example` | M | O | M | M | M | M | O | — |
| Integration / E2E in CI | R | — | M | — | R | R | — | — |
| IaC lint + plan in CI | — | — | — | M | — | R | — | — |
| Data classification in metadata | M | O | M | M | M | M | O | — |
| CODEOWNERS per area | M | M | M | M | M | **M** | R | — |
| Max lifetime without review | — | — | — | — | — | — | **90d** | — |
| Open issues/PRs frozen | — | — | — | — | — | — | — | R |

---

## Category-specific notes

### Service repos

- **Mandatory:** Runbook links, on-call rotation ID or escalation path, deployment/rollback section in `docs/` or linked platform.
- **Recommended:** SLO snippet in README or `docs/operations.md`, feature flags pointer, ADR for major boundaries.

### Libraries / packages

- **Mandatory:** Semver policy, compatibility matrix (`docs/compatibility.md` or README section), published artifact provenance if public.
- **Optional:** Changelog can be generated from conventional commits if tooling is standard.

### Frontend apps

- **Mandatory:** Build/test/lint in CI; staging URL or preview pattern documented.
- **Recommended:** Accessibility check in CI (non-blocking initially), bundle analysis on schedule.

### Infrastructure / IaC

- **Mandatory:** Plan output in PR for merge (or merge queue with plan artifact); state backend documented; blast radius notes for modules.
- **Exception:** Emergency hotfix path documented (who can apply, audit trail).

### Data repos

- **Mandatory:** Data classification, retention pointer, PII handling section; scheduled job ownership if applicable.
- **Recommended:** Lineage or catalog link (e.g., data catalog ID).

### Monorepos

- **Mandatory:** Root `docs/README.md` + CODEOWNERS path rules; per-package/service metadata **or** centralized catalog with repo ID.
- **Recommended:** Affected-projects CI (only build what changed); CODEOWNERS for `/packages/foo/**`.

### Prototypes / spikes

- **Mandatory:** README banner: **prototype**, **not production**, **sunset date**; fork-from template disclaimer.
- **Recommended:** No customer PII; feature flags off by default; short TTL branch protection relaxed **only** with EM approval.

### Archived repos

- **Mandatory:** README **ARCHIVED** banner, link to successor repo; default branch protection; issues/PRs disabled or read-only (GitHub archive mode).
- **Optional:** OpenAPI snapshot frozen for historical reference.

---

## Exception paths

- **Prototype** repos may defer `service.yaml` **only** if registered in central catalog with owner + sunset date.
- **Monorepo** may use `catalog.yaml` at root instead of per-service files if schema supports path → service mapping.

See [migration-framework.md](./migration-framework.md) for waiver template.
