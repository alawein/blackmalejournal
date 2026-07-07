# BMJ Skill Workflow

This plan defines a repeatable Codex workflow for The Black Male Journal app using the current skill set plus BMJ-specific skills to add next.

## Source Of Truth

- Product and delivery scope: tracked in active implementation plans under `docs/superpowers/plans/`
- Brand rules and art direction: [../../brand/README.md](../../brand/README.md)
- Operations and release controls: [../../ops/README.md](../../ops/README.md)
- Active implementation plans: [README.md](README.md)

## Platform Map

BMJ is not one surface. The repo currently breaks into five distinct operating areas, and the skill model should reflect that.

### 1. Public Editorial Surfaces

This is the reader-facing publication and library.

- Routes live under `src/app/(public)/`
- Shared public UI lives in `src/components/content/`, `src/components/home/`, `src/components/layout/`, and `src/components/ui/`
- Public data access lives in `src/lib/supabase/queries.ts`

Core content domains:

- Articles
- Briefings
- Dispatches
- Academy courses and lessons
- Handbooks
- Downloads
- Video
- Search

### 2. Membership And Access

This is the paid-access and portal system.

- Pricing and signup live in `src/app/(public)/pricing`, `src/app/(auth)/signup`, and `src/app/(auth)/login`
- Portal and settings live in `src/app/(auth)/portal`
- Gate logic lives in `src/components/content/PaywallGate.tsx`
- Subscription UI lives in `src/components/portal/`
- Stripe endpoints live in `src/app/api/stripe/`
- Stripe helpers live in `src/lib/stripe/`
- Access checks live in `src/lib/supabase/access.ts`

### 3. Admin CMS And Back Office

This is a real internal operating console, not a toy admin page.

- Admin routes live in `src/app/(auth)/admin/`
- Admin CRUD is centralized in `src/lib/supabase/admin-queries.ts`
- Upload handling lives in `src/components/admin/StorageUploadField.tsx` and `src/app/api/admin/upload/route.ts`

Managed entities:

- Articles
- Briefings
- Courses and lessons
- Dispatches
- Downloads
- Handbooks
- Members
- Messages
- Subscribers

### 4. Audience, Support, And Communications

This is separate from membership and should be treated separately in skills.

- Contact flow lives in `src/app/(public)/contact` and `src/app/api/contact/route.ts`
- Newsletter capture lives in `src/components/layout/NewsletterForm.tsx` and `src/app/api/newsletter/subscribe/route.ts`
- Support and donations live in `src/app/(public)/support` and `src/app/api/stripe/donate/route.ts`
- Inbox and subscriber operations are documented in [../../ops/inbox-subscriber-sop.md](../../ops/inbox-subscriber-sop.md)

### 5. Brand, Release, And Governance

These constraints are first-class. They are not optional polish.

- Brand doctrine lives in [../../brand/art-direction-spec.md](../../brand/art-direction-spec.md) and [../../brand/invariants.md](../../brand/invariants.md)
- CSS brand source of truth lives in `src/styles/brand.css` and `src/styles/globals.css`
- Release controls live in [../../ops/release-sequence.md](../../ops/release-sequence.md), [../../ops/env-audit.md](../../ops/env-audit.md), and [../../ops/launch-checklist.md](../../ops/launch-checklist.md)

## Core Workflow

### 1. Intake And Scope

Use these skills first to decide what kind of task is being handled and what artifacts must be updated.

- `alignment-planner` when the request should be checked against the master build plan.
- `repo-inspector` when the task needs a repo inventory, duplicate scan, or layout audit.
- `lane-planner` when the task affects documentation lanes or plan placement.
- `doc-auditor` when docs are already suspect or the task is doc-heavy.

Exit condition:
- The request is classified as product work, design work, ops work, docs work, or release work.
- The source-of-truth docs for that task are identified before implementation starts.

### 2. Implementation

Use app-facing skills based on the slice of the platform being changed.

- `vercel-react-best-practices` for React and Next.js changes in `src/`.
- `vercel-composition-patterns` when component APIs are getting too prop-heavy or repetitive.
- `web-design-guidelines` when auditing or refining public-facing UI.
- `deploy-to-vercel` only when the task explicitly includes preview or production deployment.

Supporting tools already available in this environment:

- `playwright` for browser checks and UI flows.
- `screenshot` for OS-level captures when visual review needs exact pixels or non-browser windows.

### 3. Verification

Use verification skills after implementation, not as a substitute for it.

- `gh-fix-ci` when GitHub Actions are failing.
- `gh-address-comments` when the active branch has review feedback to resolve.
- `doc-auditor` after any docs or runbook change.
- `monorepo-gardener` when lane invariants or README coverage may have drifted.

Exit condition:
- Tests, CI, and docs hygiene are clean enough for review.

### 4. Documentation And Audit Capture

Every substantial task should leave an explicit paper trail.

- `audits-collector` when updating or linking audit outputs.
- `changelog-keeper` when logging documentation, lane, or catalog updates.
- `archive-manager` only if an actual archive lane exists later.

Exit condition:
- The relevant `docs/` lane, README, index, audit note, and changelog entry are updated.

### 5. Release

Use release skills only when the task includes shipping.

- `deploy-to-vercel` for preview or production deploys.
- `release-notifier` only if BMJ starts tracking external repo releases from the alignment plan.

Release should always be paired with the existing ops docs:

- [../../ops/release-sequence.md](../../ops/release-sequence.md)
- [../../ops/env-audit.md](../../ops/env-audit.md)
- [../../ops/launch-checklist.md](../../ops/launch-checklist.md)

## Session Recipes

### Public UI Change

Use this sequence for homepage, article, library, or pricing-page work.

1. `alignment-planner`
2. `bmj-brand-guardian`
3. `bmj-editorial-surface`
4. `vercel-react-best-practices`
5. `vercel-composition-patterns` when shared components are involved
6. `web-design-guidelines`
7. `playwright` and `screenshot`
8. `gh-fix-ci` if CI breaks
9. `doc-auditor`
10. `changelog-keeper`

### Membership Or Billing Change

Use this sequence for pricing, Stripe, auth, or gated-content work.

1. `alignment-planner`
2. `bmj-membership-and-paywall`
3. `vercel-react-best-practices`
4. `playwright`
5. `deploy-to-vercel` when preview validation is needed
6. `doc-auditor`
7. `changelog-keeper`

### Admin CMS Change

Use this sequence for content creation, publishing flows, uploads, member management, or message/subscriber tooling.

1. `alignment-planner`
2. `bmj-admin-cms-operator`
3. `bmj-editorial-surface` when the public presentation also changes
4. `vercel-react-best-practices`
5. `playwright`
6. `doc-auditor`
7. `changelog-keeper`

### Docs Or Operations Change

Use this sequence for runbooks, audits, and planning artifacts.

1. `lane-planner`
2. `doc-auditor`
3. `audits-collector` if audit outputs are touched
4. `monorepo-gardener`
5. `changelog-keeper`

### Support, Donation, Or Newsletter Change

Use this sequence for audience capture, supporter funnel, contact triage, and donation flow changes.

1. `alignment-planner`
2. `bmj-audience-ops`
3. `vercel-react-best-practices`
4. `playwright`
5. `deploy-to-vercel` when preview validation is needed
6. `doc-auditor`
7. `changelog-keeper`

## BMJ-Specific Skills To Create

These are the highest-value custom skills for this repo after looking at the actual code and docs, not just the repo name.

### 1. `bmj-brand-guardian`

Purpose:
- Enforce BMJ visual invariants across public pages and shared components.

Trigger examples:
- "Make this match BMJ brand."
- "Audit the homepage against our art direction."
- "Refine the public pages without drifting from the brand."

Likely bundled resources:
- `references/brand.md` distilled from `docs/brand/*.md`
- `references/component-map.md` for key brand-bearing components in `src/components/home/`, `src/components/content/`, `src/components/layout/`, and `src/components/ui/`
- `references/css-sources.md` for `src/styles/brand.css`, `src/styles/globals.css`, and `tailwind.config.ts`
- optional screenshot comparison script later

Primary file focus:
- `src/styles/brand.css`
- `src/styles/globals.css`
- `src/components/brand/BrandMark.tsx`
- `src/components/ui/TreatedImage.tsx`
- `src/components/ui/StarDivider.tsx`

### 2. `bmj-editorial-surface`

Purpose:
- Handle public-facing editorial presentation, taxonomy, listing/detail behavior, and search surfaces consistently across articles, briefings, dispatches, academy, handbooks, downloads, and video.

Trigger examples:
- "Refine the article and briefing pages."
- "Change how library or academy listings work."
- "Update search, lens filters, or editorial cards."
- "Adjust the homepage editorial hierarchy."

Likely bundled resources:
- `references/editorial-map.md` covering public routes under `src/app/(public)/`
- `references/content-components.md` covering `src/components/content/` and `src/components/home/`
- `references/taxonomy.md` covering lenses, access tiers, and public content statuses from `src/lib/supabase/types.ts`

Primary file focus:
- `src/app/(public)/`
- `src/components/content/`
- `src/components/home/`
- `src/lib/supabase/queries.ts`
- `src/lib/content/search-constants.ts`

### 3. `bmj-admin-cms-operator`

Purpose:
- Operate and evolve the internal BMJ CMS for content creation, uploads, moderation, and operator workflows.

Trigger examples:
- "Add a field to article admin."
- "Fix handbook upload or download publishing."
- "Improve member, messages, or subscriber admin flows."
- "Update the publishing workflow in admin."

Likely bundled resources:
- `references/admin-map.md` covering `src/app/(auth)/admin/`
- `references/publishing.md` from [../../ops/publishing-sop.md](../../ops/publishing-sop.md)
- `references/backoffice.md` from [../../ops/inbox-subscriber-sop.md](../../ops/inbox-subscriber-sop.md) and [../../ops/member-billing-sop.md](../../ops/member-billing-sop.md)
- optional script that enumerates admin entities and their route/action pairs

Primary file focus:
- `src/app/(auth)/admin/`
- `src/lib/supabase/admin-queries.ts`
- `src/components/admin/StorageUploadField.tsx`
- `src/app/api/admin/upload/route.ts`

### 4. `bmj-membership-and-paywall`

Purpose:
- Own tier logic, signup/login handoff, Stripe checkout, billing portal, webhook reconciliation, and reader gating.

Trigger examples:
- "Fix pricing or checkout."
- "Change paywall messaging or tier behavior."
- "Debug webhook tier sync."
- "Update portal settings and upgrade flows."

Likely bundled resources:
- `references/membership.md` from [../../ops/member-billing-sop.md](../../ops/member-billing-sop.md) and [../../ops/env-vars.md](../../ops/env-vars.md)
- `references/stripe-flow.md` covering `src/app/api/stripe/` and `src/lib/stripe/`
- `references/access-model.md` covering `AccessTier`, `MemberTier`, paywall components, and access checks
- optional script that validates required membership and Stripe env vars

Primary file focus:
- `src/app/(public)/pricing/`
- `src/app/(auth)/signup/`
- `src/app/(auth)/portal/`
- `src/components/content/PaywallGate.tsx`
- `src/components/portal/`
- `src/app/api/stripe/`
- `src/lib/stripe/`
- `src/lib/supabase/access.ts`

### 5. `bmj-audience-ops`

Purpose:
- Handle contact capture, newsletter growth, donation/support flows, and the operator handoff into messages and subscriber lists.

Trigger examples:
- "Refine the support page."
- "Fix newsletter signup or subscriber tracking."
- "Improve contact triage or donor experience."
- "Adjust audience capture forms and messaging."

Likely bundled resources:
- `references/audience.md` from [../../ops/inbox-subscriber-sop.md](../../ops/inbox-subscriber-sop.md)
- `references/support.md` covering `src/app/(public)/support`, `src/app/(public)/contact`, and `src/components/layout/NewsletterForm.tsx`
- `references/comms-integrations.md` covering `src/app/api/contact/route.ts`, `src/app/api/newsletter/subscribe/route.ts`, and `src/app/api/stripe/donate/route.ts`

Primary file focus:
- `src/app/(public)/support/`
- `src/app/(public)/contact/`
- `src/components/layout/NewsletterForm.tsx`
- `src/app/api/contact/route.ts`
- `src/app/api/newsletter/subscribe/route.ts`
- `src/app/api/stripe/donate/route.ts`

### 6. `bmj-release-operator`

Purpose:
- Run the BMJ release workflow from code verification through env audit and deployment.

Trigger examples:
- "Prepare this for launch."
- "Run the BMJ release flow."
- "Ship a preview and verify the release checklist."

Likely bundled resources:
- `references/release.md` distilled from `docs/ops/release-sequence.md`, `env-audit.md`, and `launch-checklist.md`
- `references/deploy.md` covering current Vercel assumptions and `.github/workflows/ci.yml`
- optional script to assemble a release checklist snapshot

### 7. `bmj-session-closeout`

Purpose:
- Force end-of-session cleanup for docs, audits, indexes, and migration logs after substantial work.

Trigger examples:
- "Wrap this session."
- "Do the BMJ closeout."
- "Make sure docs are updated before we stop."

Likely bundled resources:
- `references/closeout.md` with exact BMJ expectations for `docs/INDEX.md`, lane READMEs, and audits

## Recommended Build Order

Create these first:

1. `bmj-brand-guardian`
2. `bmj-membership-and-paywall`
3. `bmj-admin-cms-operator`
4. `bmj-session-closeout`

Create these second:

1. `bmj-editorial-surface`
2. `bmj-audience-ops`
3. `bmj-release-operator`

Reason:
- The first group covers the highest-risk BMJ surfaces now: brand fidelity, paid access, internal CMS operations, and session hygiene.
- The second group expands operational leverage across editorial presentation, audience systems, and shipping.

## Operating Rule

For BMJ work, default to this pattern:

1. Align the task to the master plan and docs lane.
2. Identify which BMJ surface is actually being changed: public editorial, membership, admin CMS, audience ops, or release.
3. Implement with the matching BMJ-specific skill plus the general React, design, and verification skills.
4. Verify with browser checks, CI, and the relevant ops runbook.
5. Capture the result in BMJ docs before ending the session.

If BMJ-specific skills are created, they should wrap repo-specific procedure and documentation, not replace the general-purpose skills above.
