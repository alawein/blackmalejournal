-- ── lessons ─────────────────────────────────────────────────────────────────
-- Individual lessons within courses. Ordered by order_number within a course.
-- Access tier is inherited from the parent course (checked in app layer).

CREATE TABLE IF NOT EXISTS public.lessons (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    uuid        NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  title        text        NOT NULL,
  slug         text        NOT NULL,
  order_number integer     NOT NULL DEFAULT 0,
  body         text        NOT NULL DEFAULT '',
  video_url    text,
  duration     integer     NOT NULL DEFAULT 0,
  published    boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, slug)
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Public can read all lessons (access_tier checked via parent course in app layer)
CREATE POLICY "lessons_select_public"
  ON public.lessons FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS lessons_course_id_idx    ON public.lessons (course_id);
CREATE INDEX IF NOT EXISTS lessons_order_number_idx ON public.lessons (course_id, order_number);
-- NOTE: order_number is indexed but not UNIQUE-constrained so lessons can be
-- reordered without a three-step swap dance.
