import type {
  Article,
  Briefing,
  BriefingListItem,
  Member,
  Course,
  Dispatch,
  Handbook,
} from '@/lib/supabase/types';

export const mockArticle: Article = {
  id: 'art-1',
  title: 'The Discipline of Morning Routines',
  slug: 'discipline-morning-routines',
  lens: 'health',
  tags: ['discipline', 'routine', 'wellness'],
  excerpt: 'How a structured morning sets the tone for a disciplined life.',
  body: 'Full article body content here.\n\n## Section One\n\nParagraph text.',
  featured: true,
  access_tier: 'free',
  status: 'published',
  author: 'The Chairman',
  cover_image: '/images/morning.jpg',
  published_at: '2026-03-01T00:00:00Z',
  created_at: '2026-02-28T00:00:00Z',
};

export const mockArticlePremium: Article = {
  ...mockArticle,
  id: 'art-2',
  title: 'Advanced Discipline Techniques',
  slug: 'advanced-discipline',
  access_tier: 'premium',
  featured: false,
  cover_image: null,
};

export const mockArticleCulture: Article = {
  ...mockArticle,
  id: 'art-3',
  title: 'Stoicism for the Modern Black Man',
  slug: 'stoicism-modern',
  lens: 'culture',
  tags: ['stoicism', 'culture'],
};

export const mockArticlePolitics: Article = {
  ...mockArticle,
  id: 'art-4',
  title: 'Community Organizing 101',
  slug: 'community-organizing',
  lens: 'politics',
  tags: ['organizing', 'community'],
};

export const mockBriefing: Briefing = {
  id: 'br-1',
  issue_number: 1,
  title: 'Weekend Briefing No. 001',
  slug: 'weekend-briefing-001',
  sections: [
    { title: 'The Week in Review', body: 'Summary of events.' },
    { title: 'Deep Dive', body: 'In-depth analysis.' },
  ],
  lead_kicker: 'The Week in Review',
  access_tier: 'free',
  status: 'published',
  cover_image: '/images/briefing-001.jpg',
  published_at: '2026-03-01T00:00:00Z',
  created_at: '2026-02-28T00:00:00Z',
};

/** Shape returned by `getBriefings` / `getLatestBriefing` (no `sections` json). */
export const mockBriefingListItem: BriefingListItem = {
  id: mockBriefing.id,
  issue_number: mockBriefing.issue_number,
  title: mockBriefing.title,
  slug: mockBriefing.slug,
  lead_kicker: mockBriefing.lead_kicker ?? mockBriefing.sections[0]?.title ?? null,
  access_tier: mockBriefing.access_tier,
  status: mockBriefing.status,
  cover_image: mockBriefing.cover_image,
  published_at: mockBriefing.published_at,
  created_at: mockBriefing.created_at,
};

export const mockBriefingPremium: Briefing = {
  ...mockBriefing,
  id: 'br-2',
  issue_number: 2,
  title: 'Weekend Briefing No. 002',
  slug: 'weekend-briefing-002',
  access_tier: 'premium',
};

export const mockMember: Member = {
  id: 'mem-1',
  email: 'member@example.com',
  tier: 'free',
  role: 'member',
  stripe_customer_id: null,
  stripe_subscription_id: null,
  created_at: '2026-01-01T00:00:00Z',
};

export const mockMemberBasic: Member = {
  ...mockMember,
  id: 'mem-2',
  email: 'basic@example.com',
  tier: 'basic',
  stripe_customer_id: 'cus_basic123',
  stripe_subscription_id: 'sub_basic123',
};

export const mockMemberPremium: Member = {
  ...mockMember,
  id: 'mem-3',
  email: 'premium@example.com',
  tier: 'premium',
  stripe_customer_id: 'cus_premium456',
  stripe_subscription_id: 'sub_premium456',
};

export const mockCourse: Course = {
  id: 'crs-1',
  title: 'Martial Arts Fundamentals',
  slug: 'martial-arts-fundamentals',
  description: 'Build discipline through combat training.',
  category: 'martial-arts',
  access_tier: 'free',
  published: true,
  cover_image: '/images/martial-arts.jpg',
  created_at: '2026-02-01T00:00:00Z',
};

export const mockCourseUnpublished: Course = {
  ...mockCourse,
  id: 'crs-2',
  title: 'Advanced Combat',
  slug: 'advanced-combat',
  published: false,
};

export const mockHandbook: Handbook = {
  id: 'hb-1',
  title: 'The Discipline Handbook',
  slug: 'discipline-handbook',
  lens: 'health',
  description: 'A complete guide to building daily discipline.',
  body: 'Full handbook body content.',
  access_tier: 'basic',
  status: 'published',
  author: 'The Chairman',
  cover_image: '/images/discipline-handbook.jpg',
  file_url: null,
  published_at: '2026-03-10T00:00:00Z',
  created_at: '2026-03-09T00:00:00Z',
};

export const mockDispatch: Dispatch = {
  id: 'dsp-1',
  title: 'Reclaiming Your Narrative',
  slug: 'reclaiming-narrative',
  lens: 'culture',
  excerpt: 'The media tells one story. You must tell another.',
  body: 'Full dispatch body content.',
  status: 'published',
  author: 'The Chairman',
  cover_image: null,
  published_at: '2026-03-05T00:00:00Z',
  created_at: '2026-03-04T00:00:00Z',
};
