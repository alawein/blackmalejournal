-- Seed handbooks — 4 sample handbooks across lenses and tiers.
-- Safe to re-run: uses ON CONFLICT DO NOTHING.

INSERT INTO public.handbooks (title, slug, lens, description, body, access_tier, author, cover_image, published_at)
VALUES
  (
    'The Discipline Codex',
    'the-discipline-codex',
    'health',
    'A field manual for building an unbreakable body and mind through daily physical practice.',
    'Chapter 1: The Morning Protocol\n\nEvery great man begins his day before the sun. This is not motivational rhetoric — it is biological fact. The circadian rhythm rewards early risers with cortisol peaks that fuel focus, and the discipline of waking before comfort beckons builds the psychological infrastructure for every other hard thing you will do that day.\n\nChapter 2: The Training Framework\n\nStrength is not optional. It is the foundation upon which all other masculine virtues are built. A weak body houses a weak will. Your training must be consistent, progressive, and purposeful.\n\nChapter 3: Nutrition as Warfare\n\nWhat you eat is either building you up or tearing you down. There is no neutral food. Every meal is a decision about who you are becoming.',
    'basic',
    'The Chairman',
    '/placeholders/handbook.svg',
    '2026-03-01T08:00:00Z'
  ),
  (
    'Letters to a Young King',
    'letters-to-a-young-king',
    'culture',
    'Meditations on purpose, identity, and what it means to be a man in a world that fears masculine clarity.',
    'Letter I: On Purpose\n\nYoung king, the world will hand you a thousand scripts and call them freedom. Jobs, titles, accolades — each one a costume someone else designed. Purpose is different. Purpose is the thing you would do if no one was watching, if no one was paying, if no one would ever know.\n\nLetter II: On Identity\n\nYou are not your trauma. You are not your neighborhood. You are not the statistics they print about men who look like you. You are the inheritor of a tradition older than any nation on this continent.\n\nLetter III: On Solitude\n\nEvery king needs a throne room, and every throne room needs a door that closes. Solitude is not loneliness — it is the laboratory where character is refined.',
    'basic',
    'The Chairman',
    '/placeholders/handbook.svg',
    '2026-02-15T08:00:00Z'
  ),
  (
    'The Power Playbook',
    'the-power-playbook',
    'politics',
    'A strategic guide to building community power, navigating institutions, and creating parallel structures.',
    'Section 1: The Architecture of Power\n\nPower is not given. It is built. And it is built on three pillars: economic independence, institutional knowledge, and collective organization. Without all three, you are a subject, not a citizen.\n\nSection 2: The Parallel Structure\n\nWhen existing institutions refuse to serve your community, you do not beg for inclusion. You build your own. Schools, banks, media — the blueprint exists in every successful liberation movement in history.\n\nSection 3: The Long Game\n\nRevolution is not an event. It is a generational project. The men who built the institutions that now exclude us thought in centuries. We must think the same way.',
    'premium',
    'The Chairman',
    '/placeholders/handbook.svg',
    '2026-03-10T08:00:00Z'
  ),
  (
    'The Relationship Architecture',
    'the-relationship-architecture',
    'culture',
    'A premium handbook on building and maintaining meaningful relationships as a high-value man.',
    'Foundation: Self-Knowledge\n\nYou cannot build with someone else until you have built yourself. This is not selfishness — it is engineering. A bridge needs two strong foundations.\n\nFramework: Communication as Leadership\n\nLeadership in relationships is not about control. It is about clarity. The man who can articulate his vision, hear his partner without defensiveness, and make decisions that serve the unit — that man builds something that lasts.\n\nMaintenance: The Daily Practice\n\nRelationships do not survive on grand gestures. They survive on daily deposits. Attention, presence, follow-through — these are the currencies of trust.',
    'premium',
    'The Chairman',
    '/placeholders/handbook.svg',
    '2026-01-20T08:00:00Z'
  )
ON CONFLICT (slug) DO NOTHING;
