---
title: Repository Governance — 90-Day Implementation Plan
audience: [vp-eng, head-of-platform, em]
status: canonical
last-updated: 2026-03-31
---

# 90-Day Implementation Plan

**Program:** Repo Excellence Program (REP) — see [repo-governance-program.md](../standards/repo-governance-program.md).

---

## Day 0–30: Foundation

| Week | Goals | Activities | Owners | Success criteria | Risks | Communications |
|------|-------|------------|--------|------------------|-------|------------------|
| 1 | Charter + scope | Approve policy outline; pick pilot repos (8–12); assign platform DRI | Eng leadership + Platform | Signed scope; pilot list | Scope creep | Leadership email + wiki page |
| 2 | Templates ship | Publish `docs/templates/` to internal org-template repo; GitHub template repo wired | Platform | New repo can use template | Wrong template for stack | Demo in eng all-hands (5 min) |
| 3 | Automation v0 | Org workflow: README/CODEOWNERS/SECURITY presence check (**warn**) | Platform | &gt;80% pilot repos scanned without failure | False positives | #dev-platform changelog |
| 4 | Baseline audit | Run scorecard on pilot; open remediation issues | Platform + pilots | Each pilot has backlog ranked | Owner overload | EM sync: 15 min |

---

## Day 31–60: Pilot hardening

| Week | Goals | Activities | Owners | Success criteria | Risks | Communications |
|------|-------|------------|--------|------------------|-------|----------------|
| 5–6 | CI governance | Require `ci` context on pilot repos; document merge process | Platform + pilot teams | Flaky tests tagged | Blocking good PRs | Runbook for “override” (emergency) |
| 7 | Metadata schema | `service.yaml` JSON Schema + validator in CI (**warn**) | Platform | Valid metadata in pilots | Schema churn | Version schema with semver |
| 8 | Feedback loop | Survey pilots (NPS + friction log); adjust templates | Platform | ≥3 concrete template changes merged | Ignoring feedback | Thank-you + what we changed post |

---

## Day 61–90: Scale + enforce

| Week | Goals | Activities | Owners | Success criteria | Risks | Communications |
|------|-------|------------|--------|------------------|-------|----------------|
| 9–10 | Expand cohort | Add second wave (20–40 repos); keep warnings | EM + Platform | Wave 2 onboarded | Capacity | Office hours 2×/week |
| 11 | Flip to block (subset) | **Required** governance check for **new** repos + P0 list | Platform + Security | No surprise block without comms | Production hotfix blocked | “How to fix” pinned post |
| 12 | Steady-state handoff | Quarterly audit process; dashboard in prod; OKR draft | Platform | Dashboard live; owners assigned | Dashboard only | Review meeting with leadership |

---

## 90-day outcomes (targets — calibrate to org size)

| Metric | Target |
|--------|--------|
| Pilot + wave 2 repos with baseline metadata | ≥90% of in-scope |
| Median pilot scorecard | +25 points vs day 0 |
| Template usage (new repos) | 100% from template |
| Documented exceptions | 100% with expiry |

---

## Appendix A — Sample GitHub repository template structure

Tree for **`org/repo-template-default`** (illustrative):

```text
repo-template-default/
├── .editorconfig
├── .gitignore
├── CODEOWNERS
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── SECURITY.md
├── service.yaml
├── .env.example
├── docs/
│   ├── README.md
│   ├── adr/
│   │   └── .gitkeep
│   └── runbooks/
│       └── .gitkeep
├── src/
│   └── .gitkeep
├── tests/
│   └── .gitkeep
└── .github/
    ├── dependabot.yml
    ├── pull_request_template.md
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.md
    │   └── feature_request.md
    └── workflows/
        ├── ci.yml              # lint + test
        ├── governance.yml      # metadata + docs checks (warn → later required)
        └── stale.yml           # optional
```

**Notes:**

- Replace `src/` / `tests/` with stack-specific layout via **flavored** templates (`repo-template-node`, `repo-template-python`, etc.).
- Keep **one** org-wide `governance.yml` reusable workflow to avoid drift.

---

## Appendix B — Links

- [Migration framework](../standards/migration-framework.md)  
- [Automation](../standards/automation-enforcement.md)  
- [Compliance dashboard schema](../metrics/compliance-dashboard-schema.md)
