---
name: bmj-admin-cms
description: Use when building or improving admin panel features — CRUD screens, content editing UI, publishing workflows, media upload, bulk actions. The admin must be a complete no-code CMS for non-technical operators. Triggers on "admin page", "edit form", "CRUD", "publish flow", "content management", "admin UI".
---

# BMJ Admin CMS

The admin panel is a complete no-code CMS. The operator (a non-technical person) will write, edit, schedule, and publish content entirely through the UI. No terminal, no SQL, no code.

## Doc context (Tier A/B)

[AGENTS.md](../../AGENTS.md), [CLAUDE.md](../../CLAUDE.md), [docs/standards/agent-knowledge-protocol.md](../../docs/standards/agent-knowledge-protocol.md). **Task-scoped:** [docs/ops/publishing-sop.md](../../docs/ops/publishing-sop.md); [docs/CONTRIBUTING.md](../../docs/CONTRIBUTING.md) (conventions).

## Architecture

- Routes: `src/app/(auth)/admin/<domain>/`
- Navigation: `src/app/(auth)/admin/AdminNav.tsx`
- Components: `src/components/admin/`
- Server actions: `src/app/(auth)/admin/<domain>/actions.ts`
- Queries: `src/lib/supabase/admin-queries/<domain>.ts`
- Auth guard: `src/lib/admin-auth.ts` — all admin pages check role

## CRUD Screen Pattern

Every content domain follows the same file structure:

```
admin/<domain>/
  page.tsx           # List view (table with status badges, edit/delete links)
  actions.ts         # Server actions (create, update, delete)
  delete-action.ts   # Separate delete action (confirmation required)
  <Domain>Form.tsx   # Shared form for create + edit
  new/page.tsx       # Create page (renders <DomainForm>)
  [id]/edit/page.tsx # Edit page (renders <DomainForm> with prefilled data)
```

## Form Component Pattern

```tsx
'use client';
// Use controlled form with server action
// All validation via Zod schemas from src/lib/supabase/types.ts

// Required form fields per content type:
// Articles: title, slug, lens, excerpt, body, tags, access_tier, status, cover_image
// Briefings: title, slug, issue_number, sections[], access_tier, status, cover_image
// Dispatches: title, slug, body, access_tier, status
```

## UI Components Available

| Component | Purpose |
|-----------|---------|
| `AdminMetricCard` | Dashboard stats with tone (default/warning/critical/success) |
| `AdminNotice` | Info/error/success banners |
| `AdminBulkActionForm` | Multi-select operations (bulk publish, archive, delete) |
| `DeleteButton` | Confirmation dialog before delete |
| `EditorialAuditPanel` | Publishing readiness checks and warnings |
| `PublishReadinessBadge` | Visual status: ready/warning/blocked |
| `PublishScheduleField` | Date picker for scheduled publishing |
| `StorageUploadField` | File/image upload to Supabase Storage |

## Publishing Workflow

Same status chain as content authoring skill; readiness and validation live in `src/lib/admin-publishing.ts`, `PublishScheduleField`, and `EditorialAuditPanel` (see code).

## Media Upload

Use `StorageUploadField` — handles Supabase Storage upload, returns public URL:
```tsx
<StorageUploadField
  bucket="covers"
  value={coverImage}
  onChange={setCoverImage}
  helperText="Upload a cover image (JPG, PNG, WebP)"
/>
```

## Operator Experience Rules

1. **Every action through UI** — no terminal commands, SQL, or config editing
2. **Inline validation** — show errors next to the field, not in console
3. **Confirmation on destructive actions** — DeleteButton always asks first
4. **Status badges everywhere** — operator sees draft/published/scheduled at a glance
5. **Bulk operations** — select multiple items, apply action (publish, archive, delete)
6. **Rich text body editing** — body field should support markdown preview at minimum
7. **Image upload inline** — drag-and-drop or click-to-upload, not URL pasting
8. **Dashboard first** — `/admin` shows command center with attention queue, not a blank page

## Adding a New Content Domain

1. Create query module: `src/lib/supabase/admin-queries/<domain>.ts` (follow existing CRUD pattern)
2. Export from barrel: `src/lib/supabase/admin-queries/index.ts`
3. Create route directory: `src/app/(auth)/admin/<domain>/` with all 6 files above
4. Add nav link: `AdminNav.tsx`
5. Add dashboard card: `src/app/(auth)/admin/page.tsx`
6. Add tests: `tests/admin/<domain>.test.ts` and `tests/pages/admin-<domain>.test.tsx`
