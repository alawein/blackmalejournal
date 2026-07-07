// src/lib/supabase/types.ts
// Domain type aliases derived from the generated Supabase schema.
//
// Re-generate the schema file whenever migrations change:
//   npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
// Then run `npx tsc --noEmit` to catch column drift.
//
// NOTE: All row shapes are derived from `Database['public']['Tables'][...]['Row']`
// so TypeScript enforces that every alias stays in sync with the actual schema.
// TypeScript `type` aliases (not `interface`) are used throughout — interfaces
// are "open" (subject to declaration merging) and cannot satisfy the
// `Record<string, unknown>` constraints that supabase-js uses internally for
// INSERT/UPDATE operations.

import type { Database } from '@/lib/supabase/database.types';

// Re-export Database so existing callers (client.ts, server.ts, admin.ts) need
// no import-path changes.
export type { Database };

type Tables = Database['public']['Tables'];

// ── Raw row types (private to this file) ─────────────────────────────────────

type ArticleRow    = Tables['articles']['Row'];
type BriefingRow   = Tables['briefings']['Row'];
type DispatchRow   = Tables['dispatches']['Row'];
type HandbookRow   = Tables['handbooks']['Row'];
type DownloadRow   = Tables['downloads']['Row'];
type CourseRow     = Tables['courses']['Row'];
type LessonRow     = Tables['lessons']['Row'];
type MemberRow     = Tables['members']['Row'];

// ── Scalar enums — narrow string literals ─────────────────────────────────────
// These remain hand-rolled because the schema uses text + CHECK constraints
// (not Postgres enums), so the generated DB types use `string` for those
// columns. Narrowing them here keeps all existing call sites unchanged.

export type Lens = 'health' | 'politics' | 'culture' | 'entertainment' | 'business';
export type AccessTier = 'free' | 'basic' | 'premium';
export type ContentStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'archived' | 'withdrawn';
export type MemberTier = 'free' | 'basic' | 'premium';
export type PaidMemberTier = Exclude<MemberTier, 'free'>;
export type MemberRole = 'member' | 'editor' | 'admin';
export type CourseCategory = 'martial-arts' | 'mental-health' | 'relationships' | 'purpose' | 'branding';
export type ContactSubmissionStatus = 'new' | 'in_progress' | 'resolved' | 'spam';
export type AdminActivityEntityType = 'article' | 'briefing' | 'dispatch' | 'handbook' | 'download';
export type AdminActivityAction = 'created' | 'updated' | 'deleted';

// ── Composite types ───────────────────────────────────────────────────────────

export type BriefingSection = {
  title: string;
  body: string;
};

// ── Domain aliases — same exported names as before ────────────────────────────
// The schema tables use plain `string` for columns that have CHECK constraints
// (lens, access_tier, status, tier, role). We layer our narrow union types on
// top via intersection/override so callers get precise types without changing
// any call sites.

export type Article = Omit<
  ArticleRow,
  'lens' | 'access_tier' | 'status' | 'search_vector'
> & {
  lens: Lens;
  access_tier: AccessTier;
  status: ContentStatus;
};

/** Archive/card queries — no `body` or `search_vector` (smaller payloads). */
export type ArticleListItem = Pick<
  Article,
  | 'id'
  | 'title'
  | 'slug'
  | 'lens'
  | 'tags'
  | 'excerpt'
  | 'featured'
  | 'access_tier'
  | 'cover_image'
  | 'published_at'
  | 'author'
>;

// Briefing narrows the DB row's string columns and aliases sections to BriefingSection[].
// database.types.ts types sections concretely as { title: string; body: string }[]
// (rather than Json) so this derivation works without double-casting at call sites.
export type Briefing = Omit<
  BriefingRow,
  'access_tier' | 'status' | 'search_vector'
> & {
  access_tier: AccessTier;
  status: ContentStatus;
  /** Mirrors first section title; generated column — see migrations (omit on INSERT). */
  lead_kicker?: string | null;
};

/** Archive / homepage cards — no `sections` jsonb. */
export type BriefingListItem = Pick<
  Briefing,
  | 'id'
  | 'issue_number'
  | 'title'
  | 'slug'
  | 'access_tier'
  | 'status'
  | 'cover_image'
  | 'published_at'
  | 'created_at'
> & { lead_kicker: string | null };

/** Sitemap / URL enumeration — no sections or heavy fields. */
export type BriefingSitemapRow = Pick<Briefing, 'slug' | 'published_at'>;

export type Member = Omit<MemberRow, 'tier' | 'role'> & {
  tier: MemberTier;
  role: MemberRole;
};

export type Course = Omit<CourseRow, 'access_tier'> & {
  access_tier: AccessTier;
};

export type Lesson = LessonRow;

// NOTE: dispatches does NOT have an `access_tier` column in the database schema.
// The search_content() RPC returns 'free' as a sentinel for dispatches, but the
// actual table has no such column. `search_vector` is a generated column, omit
// from business logic.
export type Dispatch = Omit<DispatchRow, 'lens' | 'status' | 'search_vector'> & {
  lens: Lens;
  status: ContentStatus;
};

/** Blog listing — no `body`. */
export type DispatchListItem = Pick<
  Dispatch,
  'id' | 'title' | 'slug' | 'lens' | 'excerpt' | 'published_at'
>;

export type Handbook = Omit<
  HandbookRow,
  'lens' | 'access_tier' | 'status' | 'search_vector'
> & {
  lens: Lens;
  access_tier: AccessTier;
  status: ContentStatus;
};

export type HandbookSitemapRow = Pick<Handbook, 'slug' | 'published_at'>;

export type Download = Omit<DownloadRow, 'access_tier'> & {
  access_tier: AccessTier;
};

export type NewsletterSubscriber = Tables['newsletter_subscribers']['Row'];

export type ContactSubmission = Omit<
  Tables['contact_submissions']['Row'],
  'status'
> & {
  status: ContactSubmissionStatus;
};

// AdminActivityLog narrows the actor_role/entity_type/action string columns to
// their precise union types, and overrides `metadata` from `Json` to
// `Record<string, unknown>` — the shape the application layer actually uses.
// The database.types.ts Insert type for metadata is `Json | undefined`, but
// `Record<string, unknown>` is the practical runtime contract.
export type AdminActivityLog = Omit<
  Tables['admin_activity_log']['Row'],
  'actor_role' | 'entity_type' | 'action' | 'metadata'
> & {
  actor_role: MemberRole;
  entity_type: AdminActivityEntityType;
  action: AdminActivityAction;
  metadata: Record<string, unknown>;
};

// Narrow Insert type so call sites can pass Record<string, unknown> for metadata
// without casting. The database accepts any JSON object there.
export type AdminActivityLogInsert = Omit<
  Tables['admin_activity_log']['Insert'],
  'actor_role' | 'entity_type' | 'action' | 'metadata'
> & {
  actor_role: MemberRole;
  entity_type: AdminActivityEntityType;
  action: AdminActivityAction;
  metadata?: Record<string, unknown>;
};

// ── Member Bookmarks ──────────────────────────────────────────────────────────

export type MemberBookmark = Tables['member_bookmarks']['Row'];

// ── Search ────────────────────────────────────────────────────────────────────

export type SearchContentType = 'article' | 'briefing' | 'handbook' | 'dispatch';

export type SearchResult = {
  type: SearchContentType;
  title: string;
  slug: string;
  excerpt: string;
  lens?: Lens;
  accessTier?: AccessTier;
  publishedAt: string;
  relevance?: number;
};

// ── Bookmarks ─────────────────────────────────────────────────────────────────

export type BookmarkedItem = {
  bookmarkId: string;
  contentType: SearchContentType;
  contentId: string;
  title: string;
  slug: string;
  lens?: Lens;
  accessTier?: AccessTier;
  publishedAt: string;
  bookmarkedAt: string;
};

// ── Campaigns ─────────────────────────────────────────────────────────────────

export type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'failed';
export type AudienceFilter = { source?: string; activeOnly?: boolean };
export type Campaign = Omit<
  Tables['campaigns']['Row'],
  'status' | 'audience_filter'
> & {
  status: CampaignStatus;
  audience_filter: AudienceFilter;
};
