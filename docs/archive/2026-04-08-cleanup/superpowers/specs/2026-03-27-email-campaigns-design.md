# Email Campaigns — Compose & Preview Design

**Date:** 2026-03-27
**Status:** Approved
**Scope:** Campaign model, admin compose/edit desk, Markdown email preview with BMJ branding. No sending — that's a separate future spec.

## Context

Resend is installed (v6.9.3) but only used for contact form admin notifications. The
`newsletter_subscribers` table tracks ~N subscribers with email, source, and active/inactive
status. There is no broadcast or campaign infrastructure. This spec adds the compose and
preview layer so the operator can draft, preview, and schedule campaigns before the send
engine is built.

## Design Decisions

- **Subscribers only.** Campaigns target `newsletter_subscribers`, not members. Filter by
  source and active status. Member tier targeting is a future enhancement.
- **New /admin/campaigns desk.** Dedicated CRUD desk following the existing admin patterns
  (articles, briefings, etc.). Not an extension of /admin/subscribers.
- **Markdown body.** Consistent with article body editing. No WYSIWYG or block editor.
- **No sending.** Status workflow includes 'scheduled' and 'sent' states, but the actual
  send engine is a future task. This spec ships compose, preview, and audience targeting.
- **audience_filter as JSONB.** Flexible for future targeting extensions (member tier, etc.)
  without schema changes.

## 1. Database

### Migration: `campaigns` table

```sql
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL DEFAULT '',
  audience_filter jsonb NOT NULL DEFAULT '{}',
  recipient_count int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX campaigns_status_idx ON public.campaigns (status);
CREATE INDEX campaigns_updated_at_idx ON public.campaigns (updated_at DESC);
```

No RLS — admin-only table accessed via `createAdminClient`.

### audience_filter shape

```typescript
type AudienceFilter = {
  source?: string;      // Filter to specific source (e.g. 'website')
  activeOnly?: boolean; // Default true — only active subscribers
};
```

## 2. Admin Queries

`src/lib/supabase/admin-queries/campaigns.ts` — follows existing module pattern:

- `getAllCampaigns(options?: { status?: string })` — list with optional status filter,
  ordered by updated_at DESC
- `getCampaignById(id: string)` — single fetch, returns Campaign | null
- `createCampaign(data: CampaignInsert)` — insert, return created row
- `updateCampaign(id: string, data: CampaignUpdate)` — update, auto-set updated_at
- `deleteCampaign(id: string)` — hard delete, only for drafts
- `getAudienceCount(filter: AudienceFilter)` — count matching subscribers from
  newsletter_subscribers table. Respects activeOnly (default true) and optional source.

### Campaign type

Add to `src/lib/supabase/types.ts`:

```typescript
export type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'failed';

export type AudienceFilter = {
  source?: string;
  activeOnly?: boolean;
};

export type Campaign = {
  id: string;
  title: string;
  subject: string;
  body: string;
  audience_filter: AudienceFilter;
  recipient_count: number;
  status: CampaignStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};
```

## 3. Server Actions

`src/app/(auth)/admin/campaigns/actions.ts`:

**`saveCampaign(formData: FormData)`**
- Zod schema: title (required), subject (required), body (string), audience_filter (JSON),
  scheduled_at (optional ISO string)
- If `id` present in formData: update existing campaign
- If no `id`: create new campaign
- Computes `recipient_count` via `getAudienceCount(filter)` before saving
- If `scheduled_at` is set: status = 'scheduled', else status = 'draft'
- Redirects to `/admin/campaigns` on success

**`deleteCampaignAction(id: string)`**
- Fetch campaign, verify status is 'draft'
- If not draft: return error
- Delete and redirect to `/admin/campaigns`

## 4. Email Template

`src/lib/email-template.ts`:

**`renderCampaignEmail(subject: string, markdownBody: string): string`**
- Pure function, returns full HTML email string
- Converts Markdown to HTML using a simple converter (basic formatting: bold, italic,
  links, paragraphs, headings, lists — no need for a full Markdown library)
- Inline CSS for email client compatibility
- BMJ branding:
  - Background: #0D0C0B (bmj-black)
  - Text: #E8DCC8 (bmj-cream)
  - Accents: #C0281F (bmj-red)
  - Font stack: Georgia, 'Libre Baskerville', serif (web-safe fallback)
- Header: "THE BLACK MALE JOURNAL" in all-caps with red underline
- Body: rendered HTML
- Footer: "You received this because you subscribed to The Black Male Journal."
  + "[Unsubscribe]" placeholder link (actual unsubscribe URL added when send engine is built)

## 5. Admin UI

### List page (`/admin/campaigns`)

- Header: "CAMPAIGNS" title + "New Campaign" primary button
- Status filter tabs: All / Draft / Scheduled / Sent
- Table rows: Title, Subject (truncated), Status badge, Recipients count, Updated date
- Row actions: Edit link, Delete button (draft only)
- Empty state: "No campaigns yet. Create your first campaign."

### Compose/Edit page (`/admin/campaigns/new`, `/admin/campaigns/[id]/edit`)

**CampaignForm component** (`src/app/(auth)/admin/campaigns/CampaignForm.tsx`):
- Title input (internal label)
- Subject input (email subject line)
- Body textarea (Markdown, tall — 12-16 rows)
- Audience section:
  - "Active subscribers only" checkbox (default true)
  - Source filter: `<select>` populated from distinct sources in subscriber table, "All sources" default
  - Live count display: "This campaign will reach N subscribers"
- Schedule: optional datetime input (reuse `PublishScheduleField` pattern)
- Actions: "Save Draft" button, "Schedule" button (when date is set)
- Back link to campaign list

**Preview**: "Preview Email" button below the form that renders `renderCampaignEmail(subject, body)` in an iframe or bordered container below the form. Server-rendered — clicking preview submits a preview action that returns the rendered HTML.

### Reused components
- `AdminNotice` for success/error feedback
- `PublishScheduleField` pattern for the scheduled_at datetime input
- Standard BMJ admin styling (border-bmj-tan/20, bg-bmj-brown, font-display headings)

## 6. Files to Create/Modify

### New files
- `supabase/migrations/20260327200000_create-campaigns.sql`
- `src/lib/supabase/admin-queries/campaigns.ts`
- `src/lib/email-template.ts`
- `src/app/(auth)/admin/campaigns/page.tsx`
- `src/app/(auth)/admin/campaigns/new/page.tsx`
- `src/app/(auth)/admin/campaigns/[id]/edit/page.tsx`
- `src/app/(auth)/admin/campaigns/CampaignForm.tsx`
- `src/app/(auth)/admin/campaigns/actions.ts`
- `tests/lib/admin-queries/campaigns.test.ts`
- `tests/lib/email-template.test.ts`
- `tests/admin/campaign-actions.test.ts`
- `tests/pages/admin-campaigns.test.tsx`

### Modified files
- `src/lib/supabase/types.ts` — add Campaign, CampaignStatus, AudienceFilter types
- `src/lib/supabase/admin-queries/index.ts` — re-export campaigns module
- `src/lib/paths.ts` — add ADMIN_CAMPAIGNS, ADMIN_CAMPAIGNS_NEW
- `src/app/(auth)/admin/AdminNav.tsx` — add Campaigns nav item

## 7. Verification

1. `npx tsc --noEmit` — no type errors
2. `npm test` — all tests pass (existing + new)
3. `npm run build` — clean production build
4. `npm run lint` — no lint errors
5. Manual: create a campaign, write Markdown body, preview renders styled HTML
6. Manual: audience count updates when changing source filter
7. Manual: delete only works on draft campaigns
