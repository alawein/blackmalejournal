---
title: Repo Governance Launch Kit
audience: [vp-engineering, platform, engineering-managers]
status: ready-to-use
last-updated: 2026-03-31
---

# Repo Excellence Program (REP) Launch Kit

This kit is the execution companion to:

- `docs/standards/repo-governance-exec-readout.md`
- `docs/standards/repo-governance-program.md`
- `docs/roadmaps/repo-governance-90-day-plan.md`

---

## 1) Leadership email draft

**Subject:** Launching Repo Excellence Program (REP): faster onboarding, safer delivery

Team,

We are launching the **Repo Excellence Program (REP)** to standardize repository fundamentals across engineering without forcing one stack or slowing product delivery.

**Why now:** We are seeing repeated drag from inconsistent repository structures, unclear ownership, uneven documentation, and non-uniform CI/CD conventions. REP addresses these gaps with a small global baseline, stack-specific flexibility, and progressive enforcement.

**What is included:**
- Standard repository baselines (ownership metadata, docs minimums, security policy, branch protection)
- Copy-ready templates (README, CONTRIBUTING, CODEOWNERS, PR/issue templates, ADR, runbook, service metadata)
- A migration framework with scorecards and a clear exception process
- A 90-day rollout plan with warning-first guardrails

**What is not included:**
- No forced migration to a single language/framework
- No immediate hard-blocking across all repos
- No product architecture rewrites for style-only reasons

**What to expect next (90 days):**
1. Pilot cohort kickoff and baseline scan
2. Warning-first checks and tooling support
3. Incremental adoption by repo criticality
4. Targeted required checks after pilot stabilization

Package links:
- Executive readout: `docs/standards/repo-governance-exec-readout.md`
- Full program: `docs/standards/repo-governance-program.md`
- Rollout plan: `docs/roadmaps/repo-governance-90-day-plan.md`

Thanks,
{{VP_Eng_or_Head_of_Platform}}

---

## 2) Engineering Slack announcement

**Channel:** `#engineering` (cross-post to `#dev-platform`, `#eng-managers`)

We’re launching **Repo Excellence Program (REP)** to make repos easier to onboard, operate, and secure.

What changes:
- Standard baseline for repo ownership/docs/security
- Reusable templates for new + existing repos
- Warning-first CI governance checks (not immediate hard blocks)
- Clear exception path with expiry and ownership

What this is not:
- Not a one-size-fits-all tech stack policy
- Not bureaucracy for routine PRs

Start here:
- `docs/standards/README.md`
- `docs/standards/repo-governance-exec-readout.md`

Pilot nominations are open. Reply in thread with candidate repos (especially high-change/high-risk repos).

---

## 3) 30-minute kickoff agenda

**Attendees:** VP Eng, Head of Platform, Security lead, selected EMs, pilot repo owners

1. **Context and objective (5 min)**
   - Current repo friction and risk themes
   - Success definition for day 90
2. **Program walkthrough (8 min)**
   - Baseline controls vs recommended controls
   - Taxonomy-based exceptions
3. **Rollout mechanics (8 min)**
   - Pilot scope and owner expectations
   - Warning-to-required enforcement ramp
4. **Decisions needed (6 min)**
   - Pilot repo list
   - Enforcement start dates
   - Exception approvers
5. **Next actions (3 min)**
   - DRIs, comms send date, first audit snapshot

---

## 4) Week-1 operator checklist

- [ ] Confirm pilot repo list and owners
- [ ] Publish leadership email
- [ ] Post Slack announcement
- [ ] Open tracking issue per pilot repo with migration checklist
- [ ] Set up weekly 30-minute office hours
- [ ] Run first compliance snapshot and share baseline report
- [ ] Confirm exception registry location and approval SLA

---

## 5) Decision log template (for rollout governance)

Use this in meeting notes or as an issue template:

```markdown
## REP Decision Log Entry
- Date:
- Decision:
- Owner:
- Scope (repos/teams):
- Rationale:
- Risks:
- Follow-up action:
- Due date:
```

---

## 6) Ready-to-copy rollout templates

- Pilot nomination template: `docs/templates/rep-pilot-nomination.template.md`
- Weekly EM/repo owner status template: `docs/templates/rep-weekly-status.template.md`
- GitHub Issue Forms (YAML): `.github/ISSUE_TEMPLATE/rep-pilot-nomination.yml`, `.github/ISSUE_TEMPLATE/rep-weekly-status.yml`, `.github/ISSUE_TEMPLATE/config.yml`

---

## 7) Label, smoke test, and org rollout

### `documentation` label

REP Issue Forms apply the **`documentation`** label. On **blackmalejournal/blackmalejournal** this label already exists (default GitHub palette). For other repositories, create it before relying on auto-labeling — see [repo-governance-org-rollout.md](./repo-governance-org-rollout.md) §1.

### Smoke test (5 minutes)

1. Open **`https://github.com/blackmalejournal/blackmalejournal/issues/new/choose`**
2. Confirm **REP pilot nomination** and **REP weekly status** appear.
3. Open each form; optionally submit a test issue and close it, or verify fields render.

CLI check: `npm run verify:rep-governance` — **CI** checks template files on disk; **local** runs also verify the `documentation` label (`gh`).

Legacy one-liner (files on default branch):

```bash
gh api repos/blackmalejournal/blackmalejournal/contents/.github/ISSUE_TEMPLATE --jq ".[].name"
```

### Org-wide rollout

Use [repo-governance-org-rollout.md](./repo-governance-org-rollout.md) for org `.github` default repo, template repositories, URL replacements, and bulk label creation.

