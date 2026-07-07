-- ── storage buckets ───────────────────────────────────────────────────────────
-- Sets up 4 storage buckets used by The Black Male Journal.
--
-- covers   — public read. Article, briefing, and course cover images.
-- downloads — private (signed URLs). Gated PDFs, templates, worksheets.
-- media    — public read. Editorial images, video thumbnails.
-- avatars  — public read. Member and contributor profile photos.
--
-- Write access (INSERT/UPDATE/DELETE) for all buckets is intentionally
-- restricted to the Supabase service role key used by the admin client.
-- RLS policies here grant read-only (and for avatars, self-service write)
-- access to authenticated/anon roles. Tier-based access for downloads is
-- enforced at the application layer via signed URLs.
-- ──────────────────────────────────────────────────────────────────────────────

-- ── 1. covers ─────────────────────────────────────────────────────────────────
-- Public bucket. Images served directly via Supabase CDN.
-- 5 MB limit. PNG / JPEG / WebP only.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'covers',
  'covers',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anon and authenticated users to read any object in covers.
CREATE POLICY "covers_select_public"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'covers');

-- ── 2. downloads ──────────────────────────────────────────────────────────────
-- Private bucket. Files served only via time-limited signed URLs generated
-- server-side after tier verification. 50 MB limit. PDF and ePub only.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'downloads',
  'downloads',
  false,
  52428800,
  ARRAY['application/pdf', 'application/epub+zip']
)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users may request objects; the app layer controls whether a
-- signed URL is actually issued based on the member's access tier.
CREATE POLICY "downloads_select_authenticated"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'downloads');

-- ── 3. media ──────────────────────────────────────────────────────────────────
-- Public bucket. Editorial photography and video thumbnails.
-- 20 MB limit. PNG / JPEG / WebP / MP4.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  20971520,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'video/mp4']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anon and authenticated users to read any object in media.
CREATE POLICY "media_select_public"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'media');

-- ── 4. avatars ────────────────────────────────────────────────────────────────
-- Public bucket. Member and contributor profile photos.
-- 2 MB limit. PNG / JPEG / WebP only.
-- Authenticated users may upload and update their own avatar by placing files
-- under a folder named after their auth UID (e.g. avatars/<uid>/avatar.jpg).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anon and authenticated users to read any avatar.
CREATE POLICY "avatars_select_public"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'avatars');

-- Allow an authenticated user to upload into their own folder only.
CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow an authenticated user to overwrite files in their own folder only.
CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
