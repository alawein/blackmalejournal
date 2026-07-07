---
title: Inbox and subscriber SOP
status: operational
audience: [operators]
last-verified: 2026-04-08
---

# Inbox and Subscriber SOP

Use this workflow for contact messages and newsletter list operations.

## Messages

Route: `/admin/messages`

### Triage Statuses

- `new`
- `in_progress`
- `resolved`
- `spam`

### Workflow

1. Filter by status or search by name, email, subject, or notes.
2. Check the unresolved and overdue summary cards before triaging individual rows.
2. Open the message row.
3. Set the correct status.
4. Add internal notes if follow-up is needed.
5. Save the update.

## Subscribers

Route: `/admin/subscribers`

### Workflow

1. Filter by `All`, `Active`, or `Unsubscribed`.
2. Search by email or source.
3. Review the 30-day growth, churn, and top-source panels before campaign work.
4. Use `Export CSV` when a full list is needed for campaign work or backup.

## Operating Rules

- Mark obvious junk as `spam`.
- Use internal notes for operator context, not public-facing copy.
- Export subscriber CSVs only to approved org-controlled storage.
