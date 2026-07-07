-- Seed downloads — 6 sample downloadable files across categories.
-- Safe to re-run: uses ON CONFLICT DO NOTHING.
-- NOTE: file_url values are placeholders. Replace with Supabase Storage or CDN URLs in production.

INSERT INTO public.downloads (title, slug, description, category, file_url, file_type, file_size, access_tier, cover_image, published_at)
VALUES
  (
    'Morning Routine Template',
    'morning-routine-template',
    'A structured daily routine template to build discipline from the first hour of your day.',
    'template',
    '/files/morning-routine-template.pdf',
    'pdf',
    245760,
    'premium',
    '/placeholders/download.svg',
    '2026-03-10T08:00:00Z'
  ),
  (
    'Weekly Reflection Worksheet',
    'weekly-reflection-worksheet',
    'A guided worksheet for weekly self-assessment across body, mind, and mission.',
    'worksheet',
    '/files/weekly-reflection-worksheet.pdf',
    'pdf',
    184320,
    'premium',
    '/placeholders/download.svg',
    '2026-03-05T08:00:00Z'
  ),
  (
    'Community Organizing Toolkit',
    'community-organizing-toolkit',
    'A step-by-step toolkit for building local power structures and community networks.',
    'toolkit',
    '/files/community-organizing-toolkit.pdf',
    'pdf',
    512000,
    'premium',
    '/placeholders/download.svg',
    '2026-02-28T08:00:00Z'
  ),
  (
    'Reading List: Essential Texts',
    'reading-list-essential-texts',
    'Curated reading list of 50 essential texts on masculinity, power, and self-mastery.',
    'guide',
    '/files/reading-list-essential-texts.pdf',
    'pdf',
    102400,
    'basic',
    '/placeholders/download.svg',
    '2026-02-20T08:00:00Z'
  ),
  (
    'Financial Independence Blueprint',
    'financial-independence-blueprint',
    'A multi-phase financial planning template designed for building generational wealth.',
    'template',
    '/files/financial-independence-blueprint.pdf',
    'pdf',
    358400,
    'premium',
    '/placeholders/download.svg',
    '2026-02-15T08:00:00Z'
  ),
  (
    'Fitness Program Template',
    'fitness-program-template',
    'A 12-week progressive strength training template with tracking sheets.',
    'template',
    '/files/fitness-program-template.pdf',
    'pdf',
    409600,
    'premium',
    '/placeholders/download.svg',
    '2026-01-30T08:00:00Z'
  )
ON CONFLICT (slug) DO NOTHING;
