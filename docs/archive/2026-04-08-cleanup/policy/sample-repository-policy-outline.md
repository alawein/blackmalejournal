---
title: Sample Repository Policy — Outline
audience: [legal-review, engineering-leadership]
status: draft-outline
last-updated: 2026-03-31
---

# Sample Repository Policy Document (Outline)

*Use this outline to produce an official policy owned by Engineering + Legal + Security.*

---

## 1. Purpose and scope

1.1 Objectives: consistency, security, compliance, operational readiness.  
1.2 Applicability: all {{Company}} GitHub organizations / repositories except {{listed exceptions}}.  
1.3 Effective date and revision history.

---

## 2. Definitions

- Repository, default branch, service tier, prototype, archived repository  
- Baseline standard, recommended practice, exception (waiver)

---

## 3. Roles and responsibilities

| Role | Responsibility |
|------|----------------|
| Engineering leadership | Sponsor program; set quarterly targets |
| Platform / DevEx | Baselines, templates, automation, scorecards |
| Security | Secret scanning, vulnerability SLAs, SECURITY.md |
| Repository owners | Compliance within their repos |
| Internal audit | Sample-based verification *(if applicable)* |

---

## 4. Mandatory standards

4.1 **Metadata:** CODEOWNERS, ownership record (`service.yaml` or catalog), lifecycle state.  
4.2 **Security:** SECURITY.md, coordinated disclosure, no secrets in VCS, dependency automation.  
4.3 **Branch protection:** PR required, required status checks, no force-push to default branch.  
4.4 **Documentation:** README minimum structure; operational docs per [taxonomy](../standards/repo-taxonomy.md).  
4.5 **CI:** Lint + tests on PR; definition of “required check.”

---

## 5. Recommended standards

5.1 ADRs for significant decisions.  
5.2 Merge queue / merge groups for high-churn repos.  
5.3 Coverage targets by risk tier.

---

## 6. Exceptions

6.1 Request process, approvers, maximum duration, renewal.  
6.2 Compensating controls for security-related exceptions.  
6.3 Public exception registry.

---

## 7. Enforcement

7.1 Progressive automation: informational → warning → required.  
7.2 Consequences of sustained non-compliance (escalation path—not punitive by default).  
7.3 Emergency bypass process for incidents.

---

## 8. Tooling and data

8.1 Approved GitHub apps / Actions allowlist.  
8.2 Data retention for audit logs and compliance dashboards.

---

## 9. Review and governance

9.1 Annual policy review.  
9.2 Change control: RFC for material baseline changes.

---

## 10. References

- [Repository governance program](../standards/repo-governance-program.md)  
- [Hygiene baseline](../standards/hygiene-baseline.md)  
- [Automation](../standards/automation-enforcement.md)
