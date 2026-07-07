// src/lib/supabase/database.types.ts
// ─────────────────────────────────────────────────────────────────────────────
// GENERATED FROM MIGRATIONS — hand-authored, kept in sync with remote schema.
//
// To regenerate from remote (no Docker required):
//   supabase gen types typescript --linked > src/lib/supabase/database.types.ts
// Then strip the two CLI banner lines the tool adds at top and bottom and
// **re-narrow the jsonb columns back to their concrete shapes** — the raw
// generator types them as `Json`, but the rest of the codebase depends on:
//   - briefings.sections: { title: string; body: string }[]
//   - admin_activity_log.metadata: Record<string, unknown> | null (via Json)
// Run `npx tsc --noEmit` after any schema change to catch column drift.
// ─────────────────────────────────────────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      // ── articles ────────────────────────────────────────────────────────────
      articles: {
        Row: {
          id: string;
          title: string;
          slug: string;
          /** 'health' | 'politics' | 'culture' | 'entertainment' | 'business' */
          lens: string;
          tags: string[];
          excerpt: string;
          body: string;
          featured: boolean;
          /** 'free' | 'basic' | 'premium' */
          access_tier: string;
          /** 'draft' | 'review' | 'scheduled' | 'published' | 'archived' | 'withdrawn' */
          status: string;
          author: string;
          cover_image: string | null;
          published_at: string;
          created_at: string;
          /** GENERATED ALWAYS AS (tsvector). Included by SELECT *; omit from Insert. */
          search_vector: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          lens: string;
          tags?: string[];
          excerpt?: string;
          body?: string;
          featured?: boolean;
          access_tier?: string;
          status?: string;
          author?: string;
          cover_image?: string | null;
          published_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          lens?: string;
          tags?: string[];
          excerpt?: string;
          body?: string;
          featured?: boolean;
          access_tier?: string;
          status?: string;
          author?: string;
          cover_image?: string | null;
          published_at?: string;
        };
        Relationships: [];
      };

      // ── briefings ───────────────────────────────────────────────────────────
      briefings: {
        Row: {
          id: string;
          issue_number: number;
          title: string;
          slug: string;
          // sections is jsonb in Postgres, but in practice always an array of
          // {title: string, body: string} objects (the BriefingSection shape).
          // Typed concretely here (rather than as Json) so that `data as Briefing`
          // casts in query functions remain valid without double-casting.
          sections: { title: string; body: string }[];
          /** 'free' | 'basic' | 'premium' */
          access_tier: string;
          /** 'draft' | 'review' | 'scheduled' | 'published' | 'archived' | 'withdrawn' */
          status: string;
          cover_image: string | null;
          published_at: string;
          created_at: string;
          /** GENERATED ALWAYS AS (sections->0->>'title') STORED */
          lead_kicker: string | null;
          /** GENERATED ALWAYS AS (tsvector). Included by SELECT *; omit from Insert. */
          search_vector: string | null;
        };
        Insert: {
          id?: string;
          issue_number: number;
          title: string;
          slug: string;
          sections?: { title: string; body: string }[];
          access_tier?: string;
          status?: string;
          cover_image?: string | null;
          published_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          issue_number?: number;
          title?: string;
          slug?: string;
          sections?: { title: string; body: string }[];
          access_tier?: string;
          status?: string;
          cover_image?: string | null;
          published_at?: string;
        };
        Relationships: [];
      };

      // ── members ─────────────────────────────────────────────────────────────
      members: {
        Row: {
          id: string;
          email: string;
          /** 'free' | 'basic' | 'premium' */
          tier: string;
          /** 'member' | 'editor' | 'admin' */
          role: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          tier?: string;
          role?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
        };
        Update: {
          email?: string;
          tier?: string;
          role?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'members_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };

      // ── courses ─────────────────────────────────────────────────────────────
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          category: string;
          /** 'free' | 'basic' | 'premium' */
          access_tier: string;
          published: boolean;
          cover_image: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string;
          category: string;
          access_tier?: string;
          published?: boolean;
          cover_image?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          description?: string;
          category?: string;
          access_tier?: string;
          published?: boolean;
          cover_image?: string | null;
        };
        Relationships: [];
      };

      // ── lessons ─────────────────────────────────────────────────────────────
      lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          slug: string;
          order_number: number;
          body: string;
          video_url: string | null;
          duration: number;
          published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          slug: string;
          order_number?: number;
          body?: string;
          video_url?: string | null;
          duration?: number;
          published?: boolean;
          created_at?: string;
        };
        Update: {
          course_id?: string;
          title?: string;
          slug?: string;
          order_number?: number;
          body?: string;
          video_url?: string | null;
          duration?: number;
          published?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'lessons_course_id_fkey';
            columns: ['course_id'];
            isOneToOne: false;
            referencedRelation: 'courses';
            referencedColumns: ['id'];
          },
        ];
      };

      // ── dispatches ──────────────────────────────────────────────────────────
      // NOTE: dispatches has NO access_tier column (see FTS migration comment).
      dispatches: {
        Row: {
          id: string;
          title: string;
          slug: string;
          /** 'health' | 'politics' | 'culture' | 'entertainment' | 'business' */
          lens: string;
          excerpt: string;
          body: string;
          /** 'draft' | 'review' | 'scheduled' | 'published' | 'archived' | 'withdrawn' */
          status: string;
          author: string;
          cover_image: string | null;
          published_at: string;
          created_at: string;
          /** GENERATED ALWAYS AS (tsvector). Included by SELECT *; omit from Insert. */
          search_vector: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          lens: string;
          excerpt: string;
          body: string;
          status?: string;
          author?: string;
          cover_image?: string | null;
          published_at?: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          lens?: string;
          excerpt?: string;
          body?: string;
          status?: string;
          author?: string;
          cover_image?: string | null;
          published_at?: string;
        };
        Relationships: [];
      };

      // ── handbooks ───────────────────────────────────────────────────────────
      handbooks: {
        Row: {
          id: string;
          title: string;
          slug: string;
          /** 'health' | 'politics' | 'culture' | 'entertainment' | 'business' */
          lens: string;
          description: string;
          body: string;
          /** 'free' | 'basic' | 'premium' */
          access_tier: string;
          /** 'draft' | 'review' | 'scheduled' | 'published' | 'archived' | 'withdrawn' */
          status: string;
          author: string;
          cover_image: string | null;
          file_url: string | null;
          published_at: string;
          created_at: string;
          /** GENERATED ALWAYS AS (tsvector). Included by SELECT *; omit from Insert. */
          search_vector: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          lens: string;
          description?: string;
          body?: string;
          access_tier?: string;
          status?: string;
          author?: string;
          cover_image?: string | null;
          file_url?: string | null;
          published_at?: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          lens?: string;
          description?: string;
          body?: string;
          access_tier?: string;
          status?: string;
          author?: string;
          cover_image?: string | null;
          file_url?: string | null;
          published_at?: string;
        };
        Relationships: [];
      };

      // ── downloads ───────────────────────────────────────────────────────────
      downloads: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          category: string;
          file_url: string;
          file_type: string;
          file_size: number;
          /** 'free' | 'basic' | 'premium' */
          access_tier: string;
          cover_image: string | null;
          published_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string;
          category?: string;
          file_url: string;
          file_type?: string;
          file_size?: number;
          access_tier?: string;
          cover_image?: string | null;
          published_at?: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          description?: string;
          category?: string;
          file_url?: string;
          file_type?: string;
          file_size?: number;
          access_tier?: string;
          cover_image?: string | null;
          published_at?: string;
        };
        Relationships: [];
      };

      // ── newsletter_subscribers ──────────────────────────────────────────────
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          source: string | null;
          subscribed_at: string;
          unsubscribed_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          source?: string | null;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
        };
        Update: {
          email?: string;
          source?: string | null;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
        };
        Relationships: [];
      };

      // ── contact_submissions ─────────────────────────────────────────────────
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string | null;
          message: string;
          submitted_at: string;
          /** 'new' | 'in_progress' | 'resolved' | 'spam' */
          status: string;
          internal_notes: string | null;
          handled_at: string | null;
          /** FK → members.id */
          handled_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject?: string | null;
          message: string;
          submitted_at?: string;
          status?: string;
          internal_notes?: string | null;
          handled_at?: string | null;
          handled_by?: string | null;
        };
        Update: {
          name?: string;
          email?: string;
          subject?: string | null;
          message?: string;
          status?: string;
          internal_notes?: string | null;
          handled_at?: string | null;
          handled_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'contact_submissions_handled_by_fkey';
            columns: ['handled_by'];
            isOneToOne: false;
            referencedRelation: 'members';
            referencedColumns: ['id'];
          },
        ];
      };

      // ── admin_activity_log ──────────────────────────────────────────────────
      admin_activity_log: {
        Row: {
          id: string;
          actor_user_id: string | null;
          actor_email: string;
          /** 'admin' | 'editor' */
          actor_role: string;
          /** 'article' | 'briefing' | 'dispatch' | 'handbook' | 'download' */
          entity_type: string;
          entity_id: string;
          entity_title: string;
          /** 'created' | 'updated' | 'deleted' */
          action: string;
          summary: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_user_id?: string | null;
          actor_email: string;
          actor_role: string;
          entity_type: string;
          entity_id: string;
          entity_title: string;
          action: string;
          summary: string;
          // metadata is always a JSON object in practice — accept Record<string, unknown>
          // in addition to the full Json union so call sites don't need casts.
          metadata?: Json | Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          actor_user_id?: string | null;
          actor_email?: string;
          actor_role?: string;
          entity_type?: string;
          entity_id?: string;
          entity_title?: string;
          action?: string;
          summary?: string;
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: 'admin_activity_log_actor_user_id_fkey';
            columns: ['actor_user_id'];
            isOneToOne: false;
            referencedRelation: 'members';
            referencedColumns: ['id'];
          },
        ];
      };

      // ── member_bookmarks ─────────────────────────────────────────────────────
      member_bookmarks: {
        Row: {
          id: string;
          member_id: string;
          /** 'article' | 'briefing' | 'dispatch' | 'handbook' */
          content_type: string;
          content_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          content_type: string;
          content_id: string;
          created_at?: string;
        };
        Update: {
          member_id?: string;
          content_type?: string;
          content_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'member_bookmarks_member_id_fkey';
            columns: ['member_id'];
            isOneToOne: false;
            referencedRelation: 'members';
            referencedColumns: ['id'];
          },
        ];
      };

      // ── campaigns ────────────────────────────────────────────────────────────
      campaigns: {
        Row: {
          id: string;
          title: string;
          subject: string;
          body: string;
          audience_filter: Json;
          recipient_count: number;
          /** 'draft' | 'scheduled' | 'sent' | 'failed' */
          status: string;
          scheduled_at: string | null;
          sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          subject: string;
          body?: string;
          audience_filter?: Json;
          recipient_count?: number;
          status?: string;
          scheduled_at?: string | null;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          subject?: string;
          body?: string;
          audience_filter?: Json;
          recipient_count?: number;
          status?: string;
          scheduled_at?: string | null;
          sent_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };

    Views: Record<string, never>;

    Functions: {
      search_content: {
        Args: {
          query: string;
          filter_lens?: string[] | null;
          filter_types?: string[] | null;
          sort_by?: string;
          result_limit?: number;
        };
        Returns: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          lens: string | null;
          access_tier: string | null;
          published_at: string;
          content_type: string;
          relevance: number | null;
        }[];
      };
    };

    Enums: Record<string, never>;

    CompositeTypes: Record<string, never>;
  };
};
