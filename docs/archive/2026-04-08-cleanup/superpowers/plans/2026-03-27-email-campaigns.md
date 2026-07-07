# Email Campaigns (Compose & Preview) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a campaign compose and preview admin desk so the operator can draft, target, and preview email campaigns before the send engine is built.

**Architecture:** New `campaigns` table, admin-queries module, server actions with Zod validation, CampaignForm component, BMJ-branded email template renderer, and admin desk at `/admin/campaigns` with list, new, and edit pages.

**Tech Stack:** Supabase, Next.js Server Actions, Zod, Tailwind CSS, Markdown-to-HTML conversion

**Spec:** `docs/superpowers/specs/2026-03-27-email-campaigns-design.md`

---

## File Structure

### New files
| File | Responsibility |
|------|----------------|
| `supabase/migrations/20260327200000_create-campaigns.sql` | campaigns table |
| `src/lib/supabase/admin-queries/campaigns.ts` | CRUD + audience count queries |
| `src/lib/email-template.ts` | Markdown→HTML email renderer with BMJ branding |
| `src/app/(auth)/admin/campaigns/page.tsx` | Campaign list desk |
| `src/app/(auth)/admin/campaigns/new/page.tsx` | New campaign page |
| `src/app/(auth)/admin/campaigns/[id]/edit/page.tsx` | Edit campaign page |
| `src/app/(auth)/admin/campaigns/CampaignForm.tsx` | Compose form component |
| `src/app/(auth)/admin/campaigns/actions.ts` | Server actions: save, delete, preview |
| `tests/lib/admin-queries/campaigns.test.ts` | Query function tests |
| `tests/lib/email-template.test.ts` | Template rendering tests |
| `tests/pages/admin-campaigns.test.tsx` | List page tests |

### Modified files
| File | Changes |
|------|---------|
| `src/lib/supabase/types.ts` | Add Campaign, CampaignStatus, AudienceFilter types |
| `src/lib/supabase/admin-queries/index.ts` | Re-export campaigns module |
| `src/lib/paths.ts` | Add ADMIN_CAMPAIGNS, ADMIN_CAMPAIGNS_NEW |
| `src/app/(auth)/admin/AdminNav.tsx` | Add Campaigns nav item |

---

### Task 1: Migration + Types + Paths

**Files:**
- Create: `supabase/migrations/20260327200000_create-campaigns.sql`
- Modify: `src/lib/supabase/types.ts`
- Modify: `src/lib/paths.ts`
- Modify: `src/app/(auth)/admin/AdminNav.tsx`
- Modify: `src/lib/supabase/admin-queries/index.ts`

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20260327200000_create-campaigns.sql`:

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

- [ ] **Step 2: Add types**

Add to `src/lib/supabase/types.ts` after `BookmarkedItem`:

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

- [ ] **Step 3: Add PATHS constants**

In `src/lib/paths.ts`, add before `AUTH_CALLBACK`:

```typescript
ADMIN_CAMPAIGNS: '/admin/campaigns',
ADMIN_CAMPAIGNS_NEW: '/admin/campaigns/new',
```

- [ ] **Step 4: Add Campaigns to AdminNav**

In `src/app/(auth)/admin/AdminNav.tsx`:
- Add `Megaphone` to the lucide-react import
- Add to NAV_ITEMS array after Subscribers:
```typescript
{ href: PATHS.ADMIN_CAMPAIGNS, label: 'Campaigns', icon: Megaphone },
```

- [ ] **Step 5: Add re-export to admin-queries index**

In `src/lib/supabase/admin-queries/index.ts`, add:
```typescript
export * from './campaigns';
```

(This will fail until the campaigns module exists — that's Task 2.)

- [ ] **Step 6: Run tsc, commit**

```bash
git add supabase/migrations/20260327200000_create-campaigns.sql src/lib/supabase/types.ts src/lib/paths.ts "src/app/(auth)/admin/AdminNav.tsx" src/lib/supabase/admin-queries/index.ts
git commit -m "feat: add campaigns table, types, paths, and nav item"
```

---

### Task 2: Admin Queries + Email Template

**Files:**
- Create: `src/lib/supabase/admin-queries/campaigns.ts`
- Create: `src/lib/email-template.ts`
- Create: `tests/lib/admin-queries/campaigns.test.ts`
- Create: `tests/lib/email-template.test.ts`

- [ ] **Step 1: Write campaign query functions**

Create `src/lib/supabase/admin-queries/campaigns.ts` following the pattern of `articles.ts`:

```typescript
import { createAdminClient } from '@/lib/supabase/admin';
import type { Campaign, AudienceFilter } from '@/lib/supabase/types';
```

Functions:
- `getAllCampaigns(options?: { status?: string })` — select all, optional `.eq('status', status)`, order by `updated_at` DESC
- `getCampaignById(id: string)` — select single, `.eq('id', id).single()`
- `createCampaign(data: { title; subject; body; audience_filter; recipient_count; status; scheduled_at? })` — insert, return row
- `updateCampaign(id: string, data: Partial<...>)` — update, always set `updated_at: new Date().toISOString()`, return row
- `deleteCampaign(id: string)` — delete where id matches
- `getAudienceCount(filter: AudienceFilter)` — query `newsletter_subscribers`, apply `.is('unsubscribed_at', null)` when `activeOnly !== false`, apply `.eq('source', filter.source)` when source provided, return count

All functions return null on error, log to console.

- [ ] **Step 2: Write email template renderer**

Create `src/lib/email-template.ts`:

```typescript
export function renderCampaignEmail(subject: string, markdownBody: string): string
```

- Convert Markdown to HTML with a simple inline converter (handle: `**bold**`, `*italic*`, `[text](url)` links, `## headings`, paragraphs from double newlines, `- list items`)
- Wrap in full HTML document with inline CSS:
  - Body: `background-color: #0D0C0B; color: #E8DCC8; font-family: Georgia, 'Libre Baskerville', serif;`
  - Container: centered, max-width 600px, padding 40px
  - Header: "THE BLACK MALE JOURNAL" all-caps, letter-spacing, border-bottom #C0281F
  - H1 (subject): large, cream colored
  - Links: `color: #C0281F`
  - Footer: smaller text, bmj-tan color (#B8986A), unsubscribe placeholder
- Return the complete HTML string

- [ ] **Step 3: Write tests for queries**

Create `tests/lib/admin-queries/campaigns.test.ts`:
- getAllCampaigns returns list, respects status filter
- getCampaignById returns campaign or null
- createCampaign inserts and returns row
- updateCampaign sets updated_at
- deleteCampaign removes row
- getAudienceCount with activeOnly, with source filter, returns 0 on error

Use the same mock pattern as other admin-queries test files.

- [ ] **Step 4: Write tests for email template**

Create `tests/lib/email-template.test.ts`:
- Returns HTML string containing the subject
- Renders **bold** as `<strong>`
- Renders *italic* as `<em>`
- Renders Markdown links as `<a href="...">...</a>` elements
- Contains BMJ branding text "THE BLACK MALE JOURNAL"
- Contains unsubscribe footer text
- Contains inline CSS with bmj-black background color

- [ ] **Step 5: Run tests, run tsc, commit**

```bash
npx jest tests/lib/admin-queries/campaigns.test.ts tests/lib/email-template.test.ts --no-coverage
npx tsc --noEmit
git add src/lib/supabase/admin-queries/campaigns.ts src/lib/email-template.ts tests/lib/admin-queries/campaigns.test.ts tests/lib/email-template.test.ts
git commit -m "feat: add campaign queries and BMJ email template renderer"
```

---

### Task 3: Server Actions

**Files:**
- Create: `src/app/(auth)/admin/campaigns/actions.ts`

- [ ] **Step 1: Write server actions**

Create `src/app/(auth)/admin/campaigns/actions.ts`:

```typescript
'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createCampaign, updateCampaign, deleteCampaign, getCampaignById, getAudienceCount } from '@/lib/supabase/admin-queries';
import { PATHS } from '@/lib/paths';
import { renderCampaignEmail } from '@/lib/email-template';
import type { AudienceFilter } from '@/lib/supabase/types';
```

**`saveCampaign(formData: FormData)`**
- Zod schema: title (min 1), subject (min 1), body (string), audience_filter (JSON string parsed to AudienceFilter), scheduled_at (optional string)
- Parse audience_filter from form data, compute recipient_count via getAudienceCount
- If scheduled_at is set: status = 'scheduled', else status = 'draft'
- If formData has `id`: updateCampaign, else createCampaign
- Redirect to PATHS.ADMIN_CAMPAIGNS

**`deleteCampaignAction(id: string)`**
- Fetch campaign by id, verify status is 'draft'
- If not draft: return `{ error: 'Only draft campaigns can be deleted' }`
- Delete, redirect to PATHS.ADMIN_CAMPAIGNS

**`previewCampaignEmail(subject: string, body: string)`**
- Return `{ html: renderCampaignEmail(subject, body) }`

- [ ] **Step 2: Run tsc, commit**

```bash
npx tsc --noEmit
git add "src/app/(auth)/admin/campaigns/actions.ts"
git commit -m "feat: add campaign server actions with Zod validation"
```

---

### Task 4: Campaign List Page

**Files:**
- Create: `src/app/(auth)/admin/campaigns/page.tsx`
- Create: `tests/pages/admin-campaigns.test.tsx`

- [ ] **Step 1: Write the list page**

Create `src/app/(auth)/admin/campaigns/page.tsx`:
- Metadata: title "Campaigns", robots noindex
- Accept searchParams with optional `status` filter
- Fetch campaigns via `getAllCampaigns({ status })`
- Header: "CAMPAIGNS" title + "New Campaign" Link button to PATHS.ADMIN_CAMPAIGNS_NEW
- Status filter tabs: All / Draft / Scheduled / Sent (links with `?status=X`)
- Table: title, subject (truncated to 50 chars), status badge (colored like other admin status badges), recipient_count, updated_at formatted
- Each row: Edit link to `/admin/campaigns/${id}/edit`, Delete button (only for drafts, uses deleteCampaignAction)
- Empty state: "No campaigns yet. Create your first campaign."
- Follow the layout pattern of `/admin/articles/page.tsx`

- [ ] **Step 2: Write tests**

Create `tests/pages/admin-campaigns.test.tsx`:
- Mock getAllCampaigns
- Renders "CAMPAIGNS" heading
- Renders campaign rows when data exists
- Renders empty state when no campaigns
- Renders "New Campaign" link

- [ ] **Step 3: Run tests, tsc, commit**

```bash
npx jest tests/pages/admin-campaigns.test.tsx --no-coverage
npx tsc --noEmit
git add "src/app/(auth)/admin/campaigns/page.tsx" tests/pages/admin-campaigns.test.tsx
git commit -m "feat: add campaign list page with status filters"
```

---

### Task 5: Campaign Form + New/Edit Pages

**Files:**
- Create: `src/app/(auth)/admin/campaigns/CampaignForm.tsx`
- Create: `src/app/(auth)/admin/campaigns/new/page.tsx`
- Create: `src/app/(auth)/admin/campaigns/[id]/edit/page.tsx`

- [ ] **Step 1: Write CampaignForm component**

Create `src/app/(auth)/admin/campaigns/CampaignForm.tsx`:
- `'use client'` component
- Props: `{ campaign?: Campaign; subscriberSources: string[]; initialAudienceCount: number }`
- Form fields: title, subject, body (textarea 16 rows), audience activeOnly checkbox, source select, scheduled_at datetime input
- Shows "This campaign will reach N subscribers" (from initialAudienceCount prop — server-computed)
- Preview button: calls `previewCampaignEmail` action, renders returned HTML in a bordered container below form
- Hidden `id` field when editing existing campaign
- Hidden `audience_filter` field (JSON string built from checkbox + select state)
- Submit via form action to `saveCampaign`
- "Save Draft" submit button, "Schedule" submit button (only when scheduled_at has value)

- [ ] **Step 2: Write new campaign page**

Create `src/app/(auth)/admin/campaigns/new/page.tsx`:
- Server Component, metadata: "New Campaign"
- Fetch distinct subscriber sources for the source dropdown
- Compute initial audience count (all active subscribers)
- Render `<CampaignForm subscriberSources={sources} initialAudienceCount={count} />`

- [ ] **Step 3: Write edit campaign page**

Create `src/app/(auth)/admin/campaigns/[id]/edit/page.tsx`:
- Server Component, metadata: "Edit Campaign"
- Fetch campaign by id (notFound if missing)
- Fetch subscriber sources and audience count for the campaign's current filter
- Render `<CampaignForm campaign={campaign} subscriberSources={sources} initialAudienceCount={count} />`

- [ ] **Step 4: Run tsc, full tests, commit**

```bash
npx tsc --noEmit
npx jest --no-coverage
git add "src/app/(auth)/admin/campaigns/CampaignForm.tsx" "src/app/(auth)/admin/campaigns/new/page.tsx" "src/app/(auth)/admin/campaigns/[id]/edit/page.tsx"
git commit -m "feat: add CampaignForm with preview and new/edit pages"
```

---

### Task 6: Final Verification

- [ ] **Step 1:** `npx tsc --noEmit` — clean
- [ ] **Step 2:** `npx jest --no-coverage` — all pass
- [ ] **Step 3:** `npm run build` — clean
- [ ] **Step 4:** `npm run lint` — clean
