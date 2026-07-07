---
title: Documentation index
status: reference
audience: [contributors, agents]
last-verified: 2026-03-31
---

# Documentation Index

This index covers the committed documentation tree under `docs/`. For **how to name new Markdown files and directories** under `docs/`, see [CONTRIBUTING.md](CONTRIBUTING.md) (File naming — documentation). For **agents and contributors — which docs to load first (tiers A–D), conflict order, and anti-sprawl rules**, see [standards/agent-knowledge-protocol.md](standards/agent-knowledge-protocol.md). For a **single entry point** to the org-wide repository governance package, see [standards/README.md](standards/README.md).

**Living inventory:** run `npm run docs:inventory` from the repo root for current `.md` counts (and `docs/brand` HTML). Totals are not duplicated here to avoid stale numbers. **Frontmatter (CI):** `npm run verify:docs-frontmatter` (`docs/ops/`, `docs/brand/`, root `docs/*.md`). **Overlap scan:** `npm run docs:duplicate-audit`; CI sample: `npm run docs:duplicate-audit:ci`.

## Repository standards and governance (reference)

Cross-org / leadership reference for repository standardization (templates, policy outlines, metrics). Not BMJ-app-specific.

**Lane entry points:** [policy/README.md](policy/README.md), [roadmaps/README.md](roadmaps/README.md), [metrics/README.md](metrics/README.md), [standards/README.md](standards/README.md), [templates/README.md](templates/README.md).

- [standards/repo-governance-program.md](standards/repo-governance-program.md) - executive program narrative, operating model, rollout, KPIs.
- [standards/repo-governance-exec-readout.md](standards/repo-governance-exec-readout.md) - 1–2 page VP/Platform briefing (decision asks and guardrails).
- [standards/repo-taxonomy.md](standards/repo-taxonomy.md) - repo categories and standards matrix.
- [standards/documentation-rubric.md](standards/documentation-rubric.md) - documentation standards and quality rubric.
- [standards/agent-knowledge-protocol.md](standards/agent-knowledge-protocol.md) - tiered reading model for agents/contributors, conflict resolution, anti-sprawl controls.
- [standards/hygiene-baseline.md](standards/hygiene-baseline.md) - baseline vs recommended hygiene controls.
- [standards/migration-framework.md](standards/migration-framework.md) - migration, checklist, audit scorecard.
- [standards/automation-enforcement.md](standards/automation-enforcement.md) - automation catalog and severity ramp.
- [templates/README.md](templates/README.md) - copy-ready README, CONTRIBUTING, CODEOWNERS, PR/issue, ADR, runbook, SECURITY, service metadata.
- [policy/sample-repository-policy-outline.md](policy/sample-repository-policy-outline.md) - sample formal policy outline.
- [roadmaps/repo-governance-90-day-plan.md](roadmaps/repo-governance-90-day-plan.md) - 90-day plan and sample template tree.
- [roadmaps/repo-governance-org-rollout.md](roadmaps/repo-governance-org-rollout.md) - org rollout for Issue Forms, labels, and default community files.
- [roadmaps/repo-governance-launch-kit.md](roadmaps/repo-governance-launch-kit.md) - kickoff email, Slack, checklist, and decision log for REP rollout.
- [metrics/compliance-dashboard-schema.md](metrics/compliance-dashboard-schema.md) - compliance dashboard data schema.

## Root Documents

- [BMJ-SSOT.md](BMJ-SSOT.md) - **Single comprehensive documentation SSOT** for BMJ (product, program, repo map, governance digest, roadmap). **Share this file.**
- [bmj-platform-brief.md](bmj-platform-brief.md) - stable alias → [BMJ-SSOT.md](BMJ-SSOT.md) (legacy links).

### Design & Beautification
- [BEAUTIFICATION-SUMMARY.md](BEAUTIFICATION-SUMMARY.md) - overview of 10 core beautification enhancements.
- [BEAUTIFICATION-ENHANCEMENTS.md](BEAUTIFICATION-ENHANCEMENTS.md) - complete technical guide to animations, typography, depth, buttons, accessibility, responsive design.
- [BEAUTIFICATION-IMPLEMENTATION-GUIDE.md](BEAUTIFICATION-IMPLEMENTATION-GUIDE.md) - 100+ implementation examples for every CSS class.
- [CSS-CLASSES-REFERENCE.md](CSS-CLASSES-REFERENCE.md) - quick lookup for all 50+ CSS classes and animations.
- [ADVANCED-STYLISTIC-ENHANCEMENTS.md](ADVANCED-STYLISTIC-ENHANCEMENTS.md) - advanced features (typography effects, micro-interactions, patterns, modern UI, accessibility, dark mode, state indicators).
- [ADVANCED-STYLISTIC-ENHANCEMENTS-SUMMARY.md](ADVANCED-STYLISTIC-ENHANCEMENTS-SUMMARY.md) - implementation summary with code examples and performance notes.
- [ADVANCED-ENHANCEMENTS-QUICK-START.md](ADVANCED-ENHANCEMENTS-QUICK-START.md) - quick-reference guide with copy-paste CSS classes and component examples.

### Deployment & Operations
- [IMPLEMENTATION-EXECUTION-PLAN.md](IMPLEMENTATION-EXECUTION-PLAN.md) - **MASTER DEPLOYMENT GUIDE** with 9 comprehensive phases: development setup, testing strategy, code review, staging validation, pre-production preparation, production deployment, monitoring/incident response, rollback procedures, and post-deployment stabilization. Includes detailed step-by-step procedures, checklists, communication templates, and success criteria.
- [DEPLOYMENT-AND-MONITORING-PLAN.md](DEPLOYMENT-AND-MONITORING-PLAN.md) - comprehensive 7-phase deployment plan with monitoring, rollback, and incident response strategies.
- [DEPLOYMENT-QUICK-CHECKLIST.md](DEPLOYMENT-QUICK-CHECKLIST.md) - printable checklist for deployment day (pre-deployment, health checks, monitoring).
- [VERSION-CONTROL-STRATEGY.md](VERSION-CONTROL-STRATEGY.md) - git workflow, branching strategy, commit conventions, code review process, rollback procedures.
- [STAKEHOLDER-COMMUNICATION-GUIDE.md](STAKEHOLDER-COMMUNICATION-GUIDE.md) - communication templates for all phases, feedback collection, crisis communication.

### Core Documentation
- [DEVELOPER.md](DEVELOPER.md) - developer workflow, scripts, testing, and deployment notes.
- [ARCHITECTURE.md](ARCHITECTURE.md) - system design, data flow, database schema, integration patterns.
- [CONTRIBUTING.md](CONTRIBUTING.md) - code conventions, PR process, file naming, asset naming, testing requirements.
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - common issues and fixes for build, dev server, database, Stripe, tests, and deployment.
- [DEFERRALS.md](DEFERRALS.md) - external dependencies and configuration tasks blocked outside the repo.

## Audits

- [audits/README.md](audits/README.md) - audit lane index and current audit references.
- [audits/2026-03-25-codebase-audit.md](audits/2026-03-25-codebase-audit.md) - repository-wide codebase audit covering governance, quality gates, and coverage risk.
- [audits/2026-03-25-codebase-audit-remediation-plan.md](audits/2026-03-25-codebase-audit-remediation-plan.md) - prioritized remediation roadmap with targets and acceptance criteria from the 2026-03-25 audit.
- [audits/archive/2026-03-22-release-readiness-and-env-audit.md](audits/archive/2026-03-22-release-readiness-and-env-audit.md) - release-gate results and current Vercel environment/domain findings.
- [audits/archive/2026-03-22-docs-information-consolidation.md](audits/archive/2026-03-22-docs-information-consolidation.md) - accepted docs Markdown consolidation audit and package manifest.

## Brand

- [brand/README.md](brand/README.md) - brand lane overview.
- [brand/VISUAL-SSOT.md](brand/VISUAL-SSOT.md) - **visual & verbal identity SSOT index** (tokens authority, logos, placeholders, lenses; links [visual-ssot.html](brand/visual-ssot.html) for colorful gallery).
- [brand/art-direction-spec.md](brand/art-direction-spec.md) - visual tone and art direction spec.
- [brand/invariants.md](brand/invariants.md) - non-negotiable visual invariants.
- [brand/visual-identity-audit.md](brand/visual-identity-audit.md) - visual audit findings.
- [brand/color-system.html](brand/color-system.html) - color reference artifact.
- [brand/bmj-palettes.png](brand/bmj-palettes.png) - palette reference image.
- [brand/bmj-palettes-reference.png](brand/bmj-palettes-reference.png) - palette comparison image.

## Operations

- [ops/README.md](ops/README.md) - operations lane overview.
- [ops/chairman-consistency-reference.md](ops/chairman-consistency-reference.md) - **Chairman consistency SSOT** (domains, emails, third-party handles, brand copy, lenses, analytics; Google Doc fork note; Appendix A for technical lead).
- [ops/chairman-handbook-shareable.md](ops/chairman-handbook-shareable.md) - **Shareable Chairman one-pager** (Google Doc/Word): public identity, slim nonprofit checklist, simple habits.
- [ops/chairman-operator-manual.md](ops/chairman-operator-manual.md) - top-level operator handbook.
- [ops/publishing-sop.md](ops/publishing-sop.md) - publishing workflow.
- [ops/member-billing-sop.md](ops/member-billing-sop.md) - member billing workflow.
- [ops/inbox-subscriber-sop.md](ops/inbox-subscriber-sop.md) - inbox and subscriber workflow.
- [ops/launch-checklist.md](ops/launch-checklist.md) - pre-launch verification checklist.
- [ops/launch-dashboard-checklist.md](ops/launch-dashboard-checklist.md) - exact dashboard-by-dashboard setup for the final external launch pass.
- [ops/release-sequence.md](ops/release-sequence.md) - launch ordering and gating.
- [ops/env-vars.md](ops/env-vars.md) - environment variable reference.
- [ops/env-audit.md](ops/env-audit.md) - environment audit checklist.
- [ops/backup-restore.md](ops/backup-restore.md) - backup and restore procedure.
- [ops/secret-rotation.md](ops/secret-rotation.md) - secret rotation procedure.
- [ops/nonprofit-setup-guide.md](ops/nonprofit-setup-guide.md) - nonprofit setup guidance.

## SSOT (mirrored reference)

- [ssot-bmj/README.md](ssot-bmj/README.md) - how mirrored BMJ SSOT Markdown is synced into the repo; individual `bmj-*` files in this folder.

## Superpowers

- [superpowers/README.md](superpowers/README.md) - lane overview.
- [superpowers/plans/README.md](superpowers/plans/README.md) - implementation plan index (canonical list of dated plans).
- [superpowers/specs/README.md](superpowers/specs/README.md) - design specs paired with plans.
- [superpowers/prompts/README.md](superpowers/prompts/README.md) - prompt asset index.
- [superpowers/prompts/bmj-admin-command-center-superprompt.md](superpowers/prompts/bmj-admin-command-center-superprompt.md) - reusable prompt for autonomous BMJ admin command-center work.
