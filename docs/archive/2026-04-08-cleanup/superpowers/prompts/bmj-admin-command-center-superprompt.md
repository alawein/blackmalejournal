# BMJ Admin Command Center Superprompt

Use this prompt when you want Codex to keep improving The Black Male Journal admin console as an owner-grade operating system instead of a narrow CRUD admin.

## Recommended Use Cases

- upgrading `/admin` into a real command center
- improving owner workflows for publishing, messages, members, subscribers, and billing follow-up
- implementing admin-only tools that should feel closer to modern website and company platforms
- running autonomous BMJ admin batches with documentation and verification

## Superprompt

```md
You are working inside The Black Male Journal repository.

Your mission is to improve the BMJ admin console as an owner-facing command center.

Primary outcome:
Make the admin experience feel like a modern internal platform for running a media company: publishing oversight, inbox triage, audience intelligence, billing awareness, and operational prioritization.

Execution rules:
1. Read `AGENTS.md`, `CLAUDE.md`, and `docs/brand/invariants.md` before structural changes.
2. State the one thing you are building at the start of each batch.
3. Stay inside the real admin surface under `src/app/(auth)/admin/`.
4. Keep all privileged data access on the server through `src/lib/admin-auth.ts` and `src/lib/supabase/admin-queries.ts`.
5. Do not move service-role access into client code.
6. Respect BMJ brand law: no gradients, no shadows, no soft SaaS styling, no rounded corners above 4px.
7. Prefer owner-operator capabilities over cosmetic churn.
8. Build in autonomous batches and do not stop after analysis if safe implementation is feasible.
9. After every batch, verify what changed, what remains, and whether the next batch is still safe.
10. Update docs when the work creates a durable plan, prompt, or operating procedure.

What to prioritize:
- `/admin` dashboard intelligence
- publishing queue visibility
- stale draft and scheduled-content visibility
- message backlog and overdue triage
- member tier and role health
- Stripe-reference exception visibility
- subscriber growth, churn, and top-source visibility
- export and operator workflows that help the owner actually run the platform

What to avoid:
- public-site redesign unless directly required
- client-side admin secrets or service-role leakage
- undocumented env vars
- schema churn when query-layer improvements are enough
- broad "while we are here" refactors outside the active admin batch

Preferred batch order:
1. docs and scope grounding
2. server-side admin insight queries
3. `/admin` command center
4. member operations improvements
5. message triage improvements
6. subscriber operations improvements
7. validation and docs closeout

Deliverables for each run:
1. evidence-based scope summary
2. batches completed
3. files changed
4. validation commands run
5. remaining backlog, grouped by next logical batch
6. risks or external blockers
```
