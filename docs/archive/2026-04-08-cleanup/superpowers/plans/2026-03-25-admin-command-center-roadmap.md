# 2026-03-25 BMJ Admin Command Center Roadmap

## Objective

Build one coherent owner-facing command center for The Black Male Journal so the Chairman can operate publishing, audience, billing, and inbox workflows from a modern internal platform instead of a loose set of CRUD screens.

## Evidence Base

Current repo state confirms that BMJ already has CRUD coverage for the main admin entities:

- `src/app/(auth)/admin/page.tsx` exposes only raw count cards and quick-create links.
- `src/app/(auth)/admin/messages/page.tsx` supports triage, but not backlog prioritization or SLA-style attention signals.
- `src/app/(auth)/admin/members/page.tsx` supports filtering and edits, but not billing-health visibility or tier-distribution insight.
- `src/app/(auth)/admin/subscribers/page.tsx` supports export and search, but not growth-source or churn insight.
- `src/lib/supabase/admin-queries.ts` has reliable server-only CRUD and basic counts, but no owner-level operational intelligence layer.

This means BMJ is past "admin exists" and is now in the "operator intelligence and workflow orchestration" stage.

## Remaining Work Map

## Shipped In This Pass

- Batch 1 owner command center
- Batch 2 member and billing operations visibility
- Batch 3 inbox triage intelligence
- Batch 4 subscriber and audience operations visibility
- Batch 5 completion: server-side search, publish-readiness, recent editorial activity, explicit publish timestamp controls, edit-route owner audit panels, durable admin activity history, and bulk desk actions across the article, briefing, dispatch, handbook, and download admin desks

### Batch 1. Owner Command Center

Goal: Turn `/admin` into an operational cockpit.

Deliver:

- editorial pipeline health
- inbox backlog and overdue counts
- member and subscriber health summaries
- billing exception visibility
- scheduled publishing queue
- stale draft and review queue
- action-oriented quick links

Exit criteria:

- the dashboard tells the owner what needs attention now
- the dashboard links directly into the route that resolves the problem

### Batch 2. Member And Billing Operations

Goal: Make `/admin/members` useful for commercial and access control decisions, not just edits.

Deliver:

- tier and role distribution
- paying-member counts
- Stripe reference coverage visibility
- exception counts for members who need billing review
- recent membership growth signal

Exit criteria:

- the owner can answer "who pays, who has access, and what looks off" from one screen

### Batch 3. Inbox Triage Intelligence

Goal: Make `/admin/messages` behave like a queue, not a mailbox dump.

Deliver:

- overdue unresolved counts
- highlighted aging messages
- faster identification of submissions that need same-day attention
- stronger operator context around message backlog

Exit criteria:

- the owner can see response pressure immediately

### Batch 4. Subscriber And Audience Operations

Goal: Make `/admin/subscribers` useful for growth and retention decisions.

Deliver:

- net active audience signal
- recent 30-day subscriber growth
- recent 30-day churn
- top acquisition sources
- stronger operator framing around export and follow-up

Exit criteria:

- the owner can answer "where are subscribers coming from and are we growing or leaking"

### Batch 5. Content Workflow Refinement

Goal: Close the remaining modern-CMS gaps in content operations.

Shipped now:

- search across the article, briefing, dispatch, handbook, and download admin desks
- richer status and lens/category filter combinations on those desks
- publish-readiness signals for incomplete records
- recent editorial activity inside the owner dashboard
- explicit publish timestamp controls in the content forms
- owner audit and verification panels on the content edit routes
- durable `admin_activity_log` persistence plus recent operator history on those edit routes
- bulk status actions on article, briefing, dispatch, and handbook desks
- bulk access-tier actions on the download desk
- desk-level operator feedback for completed or failed batch changes

Status:

- core repo-native workflow refinement is now durable for the current schema
- remaining repo-native gaps are owner notes or handoff context, plus broader cross-record operations

### Batch 6. External Platform Parity

Goal: Match the operational expectations of modern website platforms where the repo alone cannot.

Requires work outside this repo:

- analytics platform wiring and event conventions
- email campaign tooling and segmentation
- richer billing telemetry beyond Stripe reference IDs
- deployment, uptime, and release telemetry surfaced inside the console

Status:

- blocked on product decisions, env configuration, or external services
- should be tracked after repo-native owner tooling is fully mature

## Execution Order For Autonomous Passes

1. Build the roadmap and prompt artifacts first so future work stays aligned.
2. Add server-side admin insight queries without weakening the current admin boundaries.
3. Upgrade `/admin` into a command center using those new insights.
4. Upgrade `/admin/members`, `/admin/messages`, and `/admin/subscribers` with owner-facing operational metrics.
5. Validate with Jest, lint, TypeScript, and a production build.
6. Update BMJ docs indexes and changelog as part of closeout.

## Guardrails

- Keep admin data access server-side in `src/lib/supabase/admin-queries.ts`.
- Do not invent new public design language; stay inside BMJ brand law.
- Prefer additive operational intelligence over schema churn unless the current schema blocks the workflow.
- Do not add "platform" features that require undocumented env vars in this pass.
- Preserve the current role safety rules around admin/member updates.

## Definition Of Done For This Pass

This roadmap pass is complete when:

- BMJ has a reusable admin-owner execution prompt
- `/admin` is an owner command center instead of only a counts page
- members, messages, and subscribers expose real operational insight
- documentation captures what was executed and what remains
