---
title: Chairman operator manual
status: operational
audience: [chairman, operators]
last-verified: 2026-03-31
---

# Chairman Operator Manual

This is the top-level operating guide for BMJ after handoff. Use the SOPs below for the step-by-step workflows.

## Daily Surfaces

- Public site: `/`
- Member portal: `/portal`
- Admin dashboard: `/admin`
- Messages triage: `/admin/messages`
- Members: `/admin/members`
- Subscribers: `/admin/subscribers`
- Courses: `/admin/courses`

## Start Of Day

1. Open `/admin` first.
2. Read the command-center cards for inbox pressure, editorial backlog, scheduled publishing, paying members, and subscriber motion.
3. Resolve any attention-queue item before creating new content.
4. Use the linked desk route to handle the actual work, including bulk desk actions when the same update applies to multiple records.
5. On content edit routes, use the owner audit panel to verify publish timing, recent operator history, blockers, and public or protected route targets before leaving the record.

## Core Operator Workflows

- Publishing and content updates: [publishing-sop.md](publishing-sop.md)
- Member tier and billing operations: [member-billing-sop.md](member-billing-sop.md)
- Inbox and subscriber handling: [inbox-subscriber-sop.md](inbox-subscriber-sop.md)
- Launch and release checks: [launch-checklist.md](launch-checklist.md)
- Backup and restore: [backup-restore.md](backup-restore.md)

## Operator Rules

1. Do not edit production data directly in Supabase unless the admin panel cannot complete the task.
2. Use the upload controls in admin forms before pasting raw file paths.
3. For paid access issues, treat Stripe webhook completion as the source of truth.
4. Never remove the final `admin` role from the members table.
5. Run the launch checklist before any production announcement or campaign push.

## If Something Looks Wrong

1. Check `/admin` for billing exceptions, stale editorial items, and overdue inbox pressure.
2. Check `/admin/messages` for recent contact issues.
3. Check the affected member in `/admin/members/[id]`.
4. Verify the environment and webhook configuration against [env-audit.md](env-audit.md).
5. If the issue involves checkout or billing, use [member-billing-sop.md](member-billing-sop.md).
