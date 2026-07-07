-- Create member_bookmarks table for saved content feature

CREATE TABLE public.member_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('article', 'briefing', 'dispatch', 'handbook')),
  content_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Prevent duplicate bookmarks
ALTER TABLE public.member_bookmarks
  ADD CONSTRAINT member_bookmarks_unique UNIQUE (member_id, content_type, content_id);

-- Fast portal lookups by member
CREATE INDEX member_bookmarks_member_id_idx ON public.member_bookmarks (member_id);

-- RLS: members can only access their own bookmarks
ALTER TABLE public.member_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY member_bookmarks_select ON public.member_bookmarks
  FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY member_bookmarks_insert ON public.member_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY member_bookmarks_delete ON public.member_bookmarks
  FOR DELETE USING (auth.uid() = member_id);
