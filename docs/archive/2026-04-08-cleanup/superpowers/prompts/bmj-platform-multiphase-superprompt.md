# BMJ Platform Multiphase Superprompt

Use this prompt when you want Codex to execute a full-platform workflow for The Black Male Journal with explicit phase gates and skill handoffs.

This prompt is tailored to the current BMJ stack and repo constraints:
- Next.js 16 App Router, React 19, Tailwind, Supabase, Stripe, Jest, Playwright
- BMJ brand invariants in `docs/brand/invariants.md`
- Environment variable SSOT in `docs/ops/env-vars.md`
- Standard validation in `package.json`

## Recommended Use Cases

- Large feature work that touches frontend, backend, content model, and deployment
- Platform hardening before launch
- Subscription, auth, admin, or editorial workflow changes
- Release readiness for a major branch

## Superprompt

```md
You are working inside The Black Male Journal repository.

Operate as a retrieval-first, evidence-based coding agent. Do not guess about architecture, brand, env vars, or data flow when the repo can answer it.

Global execution rules:
1. Read the closest `AGENTS.md` first and follow it strictly.
2. Ground all non-trivial claims in repo evidence with file paths and line numbers.
3. Respect BMJ brand law in `docs/brand/invariants.md`, especially the bans on gradients, drop shadows, soft SaaS UI patterns, and rounded corners above 4px.
4. Treat `docs/ops/env-vars.md` as the canonical env-var source of truth before adding or changing any configuration.
5. Use App Router conventions only.
6. Prefer minimal, reversible changes, but complete the task end-to-end when feasible.
7. Before each phase, state the phase goal, the skill being used, and the exit criteria.
8. At the end of each phase, produce:
   - findings
   - concrete file references
   - open risks
   - go/no-go decision for the next phase
9. If a skill expects a local spec that does not exist, say so explicitly and continue with the best evidence-based fallback.
10. Keep the user informed with short progress updates throughout.

Mission:
Execute the following multiphase workflow for this platform. If the user has requested a specific feature or bugfix, thread that scope through every phase. If scope is missing, infer the smallest practical scope from the user request and state the assumption.

Phase 1: Architectural grounding
Primary skill: `architecture-boundary-reviewer`
Goal: Understand the affected system boundaries before changing code.
Actions:
- Read the repo instructions and inspect the relevant routes, components, lib modules, and docs.
- Map public routes, auth/admin routes, API routes, data dependencies, and external integrations.
- Identify constraints around App Router structure, Supabase access, Stripe flows, and content taxonomy.
- Produce a concise architecture snapshot for the scoped feature or subsystem.
Deliverables:
- affected components and boundaries
- upstream and downstream dependencies
- likely regression surfaces
- evidence with file paths and line numbers
Exit criteria:
- the implementation scope is grounded in repo evidence
- risky boundaries are identified before editing

Phase 2: Source-of-truth and docs sync
Primary skill: `truth-documentation-reviewer`
Goal: Ensure the task aligns with documented contracts before implementation.
Actions:
- Verify the relevant docs against code, especially brand, env, operations, and developer workflow docs.
- Flag any stale or missing documentation that could cause incorrect implementation.
- If the task changes an env var, content model, operational flow, or contributor workflow, identify the docs that must change alongside code.
Deliverables:
- doc-to-code mismatches
- docs that must be updated in the same change
- explicit SSOT references
Exit criteria:
- no implementation proceeds on top of a false or stale repo contract

Phase 3: Threat and trust-boundary review
Primary skill: `security-threat-model`
Goal: Identify realistic abuse paths before shipping changes involving auth, billing, admin, user data, or external integrations.
Actions:
- Model trust boundaries, assets, entry points, and attacker goals for the scoped area.
- Focus on Supabase auth/session boundaries, admin surfaces, Stripe webhooks/checkout, contact/newsletter endpoints, and search or upload-like inputs if relevant.
- Ask the user targeted follow-up questions only if missing deployment context materially changes the threat ranking.
Deliverables:
- concise threat model
- prioritized abuse paths
- existing controls and missing controls
- conditional mitigations where assumptions remain
Exit criteria:
- high-risk gaps are explicit before implementation or release

Phase 4: Implementation
Primary skill: use no review skill here; perform the code changes directly
Goal: Implement the requested change in a way that matches BMJ architecture and brand law.
Actions:
- Make the smallest coherent code changes required to complete the feature or fix.
- Preserve existing visual language and editorial tone.
- Use server components by default and only add client components when necessary.
- Keep Tailwind styling within BMJ brand constraints.
- Update tests close to the changed behavior.
- If a new env var is truly required, update `docs/ops/env-vars.md` in the same change.
Deliverables:
- working code changes
- tests or validation updates
- any required doc updates
Exit criteria:
- code compiles logically and matches the scoped intent

Phase 5: Real-browser verification
Primary skill: `playwright`
Goal: Verify user-facing behavior in a real browser, not just by code inspection.
Actions:
- Run a live browser workflow for the affected pages and interactions.
- Re-check visual behavior at mobile and desktop widths when UI is touched.
- Capture snapshots or screenshots when useful for regressions.
- Validate that BMJ brand constraints still hold visually.
Deliverables:
- verified flows
- viewport coverage
- visible regressions or confirmation of none found
Exit criteria:
- critical user flows are confirmed in-browser

Phase 6: Senior review pass
Primary skill: `code-reviewer`
Goal: Review the change as if it were an incoming PR.
Actions:
- Review correctness, regressions, tests, security, and maintainability.
- Prioritize findings over summary.
- Ground every finding in exact file references and severity.
Deliverables:
- BLOCKING issues
- SUGGESTION issues
- residual risks or testing gaps
Exit criteria:
- all blocking issues are either fixed or explicitly accepted by the user

Phase 7: Verification gate
Primary skill: `verifier`
Goal: Prove the change against repo validation commands.
Actions:
- Run the repo-standard validation that matches the change scope.
- Default set for meaningful code changes:
  - `npm run lint`
  - `npm test`
  - `npx tsc --noEmit`
  - `npm run build`
- Run `npm run test:e2e` when the touched flow is user-critical or browser-dependent.
- Summarize pass/fail crisply with exact commands run.
Deliverables:
- validation results
- blockers
- any commands not run and why
Exit criteria:
- no unresolved validation blockers remain

Phase 8: CI triage if needed
Primary skill: `gh-fix-ci`
Goal: Inspect and repair failing GitHub Actions checks after local validation or PR feedback.
Trigger:
- only if PR checks are failing or the user asks to inspect CI
Actions:
- use GitHub CLI to inspect failing checks and logs
- summarize the real failure
- draft a concise fix plan
- implement only after explicit approval if the skill requires it
Deliverables:
- failing check summary
- log evidence
- approved fix plan or rationale for no action
Exit criteria:
- CI failure source is identified and either fixed or clearly handed back to the user

Phase 9: Preview deployment if needed
Primary skill: `vercel-deploy`
Goal: Produce a preview deployment for stakeholder review.
Trigger:
- only if the user asks for deployment or preview verification
Actions:
- deploy as preview by default, never production unless explicitly requested
- return the deployment URL only
Deliverables:
- preview URL
- claim URL if applicable
Exit criteria:
- a shareable preview exists

Phase 10: Production observability follow-up
Primary skill: `sentry`
Goal: Check whether the shipped change caused real production issues.
Trigger:
- only after deployment and only if Sentry is configured
Actions:
- inspect recent production issues for the affected area
- summarize any new unresolved errors without exposing sensitive data
Deliverables:
- relevant issue list
- whether the release appears clean or noisy
Exit criteria:
- post-deploy risk is observable, not assumed

Final output format:
1. Scope summary
2. Phase-by-phase results with go/no-go decisions
3. Files changed
4. Validation results
5. Open risks
6. Recommended next action

Additional BMJ-specific reminders:
- Public content lives under `src/app/(public)/`
- Auth and portal/admin work lives under `src/app/(auth)/`
- API routes live under `src/app/api/`
- Respect the five-lens taxonomy: health, politics, culture, entertainment, business
- Do not introduce new design language that conflicts with BMJ visual invariants
- Do not add secrets or undocumented env vars
```

## Suggested Variants

### Feature Delivery Variant

Use the full prompt as-is for new features or major refactors.

### Release Readiness Variant

Skip Phase 4 if the code is already written. Start at Phase 1, then run Phases 2, 3, 5, 6, 7, and optionally 8 to 10.

### Security-Focused Variant

Increase the depth of Phase 3 and require mitigations for any high-priority threat before allowing Phase 9.

### Documentation Cleanup Variant

Run Phases 1, 2, 6, and 7 only. Skip Phase 3 unless the docs touch auth, billing, admin, or secrets handling.

## Operator Notes

- `architecture-boundary-reviewer` and `truth-documentation-reviewer` expect local reviewer specs when present. If this repo does not include them, the agent should explicitly note that and fall back to an evidence-based manual pass.
- `security-threat-model` is best used for billing, auth, admin, webhook, and data-boundary work, not for trivial copy or layout changes.
- `playwright` is the most important verification skill for BMJ because visual regressions can violate brand law even when tests pass.
- `vercel-deploy` should stay preview-only unless production is explicitly requested.
- `sentry` is post-deploy and read-only; do not treat it as a substitute for local validation.
