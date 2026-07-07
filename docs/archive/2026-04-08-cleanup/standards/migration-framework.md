---
title: Repository Migration Framework
audience: [platform, em, owners]
status: canonical
last-updated: 2026-03-31
---

# Migration Framework

## Repo assessment method

### Automated signals (collect via API / scripts)

| Signal | Weight | Source |
|--------|--------|--------|
| Has `README`, `SECURITY.md`, `CODEOWNERS` | High | GitHub API |
| Branch protection configured | High | Org API |
| Required checks present | High | Branch protection API |
| Secret scanning / Dependabot enabled | Medium | Repo settings |
| Last commit age | Medium | Git log |
| Open critical Dependabot alerts | High | Dependabot API |

### Manual review (15–30 min per repo)

- README: can a new engineer run locally?
- Runbook exists for production services?
- `service.yaml` matches actual team?
- License present or justified?

---

## Prioritization framework

**Score = (Business criticality × Security/data risk × Compliance touch) ÷ Migration effort**

| Factor | Scale |
|--------|-------|
| **Criticality** | 1 (internal tool) – 5 (revenue-critical) |
| **Risk** | 1 (no PII) – 5 (regulated / highly exposed) |
| **Compliance** | 0 (none) – 3 (SOC2/ISO scope) |
| **Effort** | 1 (few files) – 5 (monorepo / legacy) |

**Buckets:**

1. **P0** — Score ≥ threshold (e.g., top 15%): migrate in current quarter.
2. **P1** — Medium: incremental.
3. **P2** — Low: backlog; warn-only automation.

---

## Quick wins vs deeper remediation

| Quick win (days) | Deeper remediation (weeks+) |
|------------------|-----------------------------|
| Add missing `SECURITY.md`, CODEOWNERS | Split monorepo ownership model |
| Template README header + `.env.example` | Full CI redesign |
| Enable Dependabot with default config | Contract testing suite |
| Branch protection + required CI | Merge queue + flaky test cleanup |

---

## Automated vs manual changes

| Automated (bots / scripts) | Manual |
|----------------------------|--------|
| Open PR adding standard files | Architecture doc authorship |
| Validate `service.yaml` schema | Runbook content accuracy |
| Fix `.gitignore` patterns | Team process for on-call |
| Label stale issues | Deprecation comms to customers |

---

## Exception handling

Use **one** exception record per waiver (file or registry row):

```markdown
## Exception: <repo-name>
- **ID:** EX-2026-001
- **Requested by:** @owner
- **Standard waived:** e.g., CHANGELOG not required
- **Rationale:** …
- **Risk:** Low/Med/High
- **Compensating controls:** …
- **Approver:** @platform-lead @security (if applicable)
- **Expires:** YYYY-MM-DD
- **Review date:** calendar invite to Platform
```

---

## Sunset / archive process

1. Announce successor repo or deprecation.
2. Freeze releases; merge only critical fixes.
3. README banner + `SECURITY.md` update (“report issues in X”).
4. Archive GitHub repo; retain for legal retention if needed.

---

## Sample migration checklist

Use per-repo; copy to issue or PR description.

- [ ] **Metadata:** `service.yaml` / catalog entry accurate
- [ ] **Ownership:** `CODEOWNERS` covers all critical paths
- [ ] **Security:** `SECURITY.md`; secret scanning on; no secrets in history (verified sample)
- [ ] **Docs:** README quickstart works on clean machine; `docs/README.md` index
- [ ] **CI:** Lint + tests required; main protected
- [ ] **Dependencies:** Dependabot/Renovate configured; SLA acknowledged
- [ ] **Runbooks:** Linked for tier-1+ services
- [ ] **Exceptions:** None **or** documented with expiry
- [ ] **Sign-off:** Repo owner + platform delegate

---

## Repo audit scorecard

**Scoring:** Each category 0–4; **total / max** for percentage. **Pass threshold:** org-defined (e.g., ≥75% with no category below 2 for critical repos).

| Category | Weight | 0 | 1 | 2 | 3 | 4 |
|----------|--------|---|---|---|---|---|
| **Ownership & metadata** | 20% | Missing | Partial CODEOWNERS | Full CODEOWNERS | + service.yaml | + catalog sync |
| **Documentation** | 25% | README useless | Minimal quickstart | README + docs index | + runbook/arch | Exemplary rubric |
| **Security** | 25% | No SECURITY | SECURITY only | + scanning | + dependency policy | + audit evidence |
| **CI/CD** | 20% | No CI | CI informal | Required checks | + merge queue | + deployment contract |
| **Dependencies** | 10% | None | Ad hoc updates | Bot enabled | SLA met | Freshness SLO tracked |

### Decision thresholds

| Score | Action |
|-------|--------|
| &lt; 50% | Block new feature work until plan (exceptions for emergencies) |
| 50–74% | Remediation issue filed; **warn** in dashboard |
| ≥ 75% | **Pass**; optional polish |

*Adjust weights for libraries (reduce runbook weight) or infra (increase CI/CD weight).*
