---
title: Publishing SOP
status: operational
audience: [operators, editors]
last-verified: 2026-04-08
---

# Publishing SOP

Use this workflow for articles, briefings, dispatches, handbooks, downloads, courses, and lessons.

## Before You Publish

1. Confirm the content type and destination route.
2. Prepare title, slug, body, excerpt or description, and access tier.
3. Upload the cover, media, or file asset in the admin form before saving.
4. For scheduled content, set `published_at` in the `Publish At (UTC)` field before switching to `scheduled`.
5. Use the content-desk publish-readiness cards and row badges to clear blocked items and review warnings before release.
6. On edit routes, use the owner audit panel to confirm lifecycle timing, recent operator activity, public route targets, and file-delivery links before release.

## Content Routes

- Articles: `/admin/articles`
- Briefings: `/admin/briefings`
- Dispatches: `/admin/dispatches`
- Handbooks: `/admin/handbooks`
- Downloads: `/admin/downloads`
- Courses: `/admin/courses`

## Publishing Steps

1. Open the correct admin section.
2. Use the desk search and status or lens or category filters if you need to locate an existing record quickly.
3. If multiple records need the same state change, use the bulk desk action controls first.
4. Create a new record or edit the existing record when the change is item-specific.
5. Upload assets using the inline upload controls.
6. Save the record and confirm the row no longer shows a blocked readiness badge.
7. For public content, switch the status to `published`, or to `scheduled` with a valid UTC publish time.
8. Reopen the edit route if needed and use the owner audit panel to confirm lifecycle timing, recent operator activity, open issues, and route or file verification links.
9. Recheck the desk summary cards so the item moves into `Ready` or only a deliberate `Review` state.
10. Open the public URL and confirm the page layout at the destination route.

## Required Verification

- Title and slug are correct.
- Access tier matches the intended audience.
- Cover image loads.
- Download or handbook file opens through the signed route if applicable.
- Course lessons appear in the correct order.
- Premium or Basic gates show the expected paywall message when signed out.

## Rollback

1. Reopen the content record in admin.
2. Change status to `draft`, `archived`, or `withdrawn` as appropriate.
3. Save.
4. Recheck the public route to confirm the content is no longer exposed.
