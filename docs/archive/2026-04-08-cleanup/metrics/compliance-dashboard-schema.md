---
title: Compliance Dashboard — Sample Schema
audience: [data, platform, bi]
status: canonical
last-updated: 2026-03-31
---

# Sample Compliance Dashboard Schema

Use this schema to load nightly GitHub/org inventory into a warehouse (BigQuery, Snowflake, etc.) and power Looker, Grafana, or Hex dashboards.

---

## Entity: `repo_compliance_snapshot`

One row per repository per `snapshot_date` (daily batch).

| Column | Type | Description |
|--------|------|-------------|
| `snapshot_date` | DATE | UTC date of ETL run |
| `org` | STRING | GitHub org name |
| `repo` | STRING | Repository name |
| `repo_id` | INT64 | GitHub GraphQL `databaseId` (stable) |
| `default_branch` | STRING | Usually `main` |
| `lifecycle` | STRING | `production` \| `development` \| `prototype` \| `deprecated` \| `archived` \| `unknown` |
| `taxonomy` | STRING | From topic tags or manual mapping: `service` \| `library` \| `frontend` \| `infra` \| `data` \| `monorepo` \| `prototype` |
| `is_archived` | BOOL | GitHub archived flag |
| `has_readme` | BOOL | `README.md` exists at root |
| `has_security_md` | BOOL | `SECURITY.md` exists |
| `has_codeowners` | BOOL | `CODEOWNERS` or `.github/CODEOWNERS` |
| `has_contributing` | BOOL | `CONTRIBUTING.md` |
| `has_service_yaml` | BOOL | `service.yaml` or `catalog/service.yaml` |
| `service_yaml_valid` | BOOL | Schema validation result |
| `branch_protection_enabled` | BOOL | On default branch |
| `requires_pr` | BOOL | Branch protection |
| `requires_code_owner_review` | BOOL | If applicable |
| `required_check_contexts` | ARRAY<STRING> | List of required status checks |
| `has_ci_workflow` | BOOL | `.github/workflows/*.yml` present |
| `dependabot_enabled` | BOOL | Dependabot config or org enablement |
| `secret_scanning_enabled` | BOOL | GitHub Advanced Security or equivalent |
| `open_critical_dependabot` | INT64 | Count of open critical/high *(severity mapping policy-specific)* |
| `last_commit_at` | TIMESTAMP | Default branch last commit |
| `days_since_commit` | INT64 | Derived |
| `codeowners_coverage_ratio` | FLOAT64 | Optional: % paths with explicit owner *(advanced)* |
| `scorecard_total` | FLOAT64 | 0–100 weighted score |
| `scorecard_tier` | STRING | `pass` \| `warn` \| `fail` |
| `exception_ids` | ARRAY<STRING> | Active waiver IDs touching this repo |
| `owner_team` | STRING | From `service.yaml` or catalog |

---

## Entity: `exception_record`

One row per active or historical exception.

| Column | Type | Description |
|--------|------|-------------|
| `exception_id` | STRING | e.g. `EX-2026-001` |
| `repo_id` | INT64 | FK to repo |
| `standard_waived` | STRING | Machine-readable key |
| `requested_by` | STRING | LDAP or GitHub handle |
| `approved_by` | ARRAY<STRING> | Approvers |
| `expires_on` | DATE | Must be set |
| `status` | STRING | `active` \| `expired` \| `revoked` |
| `risk_level` | STRING | `low` \| `medium` \| `high` |

---

## Entity: `audit_event` (optional)

Append-only for forensics.

| Column | Type | Description |
|--------|------|-------------|
| `event_id` | STRING | UUID |
| `occurred_at` | TIMESTAMP | |
| `repo_id` | INT64 | |
| `event_type` | STRING | `branch_protection_changed` \| `workflow_added` \| … |
| `actor` | STRING | |
| `payload_json` | JSON | |

---

## Sample SQL: org rollup

```sql
SELECT
  snapshot_date,
  COUNTIF(has_security_md AND has_codeowners AND branch_protection_enabled) * 100.0 / COUNT(*) AS pct_baseline_core
FROM `analytics.repo_compliance_snapshot`
WHERE snapshot_date = CURRENT_DATE()
  AND NOT is_archived
GROUP BY snapshot_date;
```

---

## Dashboard panels (recommended)

1. **Trend:** `% baseline core` over 90 days.  
2. **Distribution:** Scorecard histogram by `taxonomy`.  
3. **Exceptions:** Count by `risk_level`; expiring in 30 days.  
4. **Freshness:** Median `days_since_commit` by `owner_team`.  
5. **Dependencies:** Sum `open_critical_dependabot` by domain.

---

## PII and access

- Restrict dashboard to **employees**; exclude personal repos if any in org.  
- Do not store **secret** contents—only boolean flags.
