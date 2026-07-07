-- Seed data for the courses table.
-- Run against your Supabase project: psql <connection_string> -f supabase/seed-courses.sql
-- Or paste into the Supabase SQL Editor.

INSERT INTO courses (title, slug, description, category, access_tier, published, cover_image) VALUES
  ('Fundamentals of Combat Discipline', 'fundamentals-of-combat-discipline',
   'Build a warrior''s foundation. This course covers striking fundamentals, defensive positioning, and the mental discipline that separates fighters from practitioners.',
   'martial-arts', 'free', true, '/placeholders/course.svg'),

  ('The Stoic Man''s Framework', 'the-stoic-mans-framework',
   'Ancient philosophy meets modern manhood. Learn to apply Stoic principles to daily decisions, emotional regulation, and long-term purpose.',
   'purpose', 'free', true, '/placeholders/course.svg'),

  ('Building Your Personal Brand', 'building-your-personal-brand',
   'Your name is your currency. Master the fundamentals of personal branding — from visual identity to voice, positioning, and platform strategy.',
   'branding', 'premium', true, '/placeholders/course.svg'),

  ('Emotional Intelligence for Men', 'emotional-intelligence-for-men',
   'Strength isn''t silence. Develop emotional literacy, learn to read social dynamics, and build the communication skills that command respect.',
   'mental-health', 'free', true, '/placeholders/course.svg'),

  ('Partnership & Power Dynamics', 'partnership-and-power-dynamics',
   'Navigate relationships with intention. Explore attachment theory, conflict resolution, and the dynamics of power and vulnerability in partnership.',
   'relationships', 'premium', false, '/placeholders/course.svg'),

  ('Advanced Self-Defense Systems', 'advanced-self-defense-systems',
   'Beyond the basics. Integrate Krav Maga, Brazilian Jiu-Jitsu, and situational awareness into a personal defense system built for real-world scenarios.',
   'martial-arts', 'premium', false, '/placeholders/course.svg');
