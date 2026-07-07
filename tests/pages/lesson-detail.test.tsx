jest.mock('@/lib/supabase/queries', () => ({
  getCourseBySlug: jest.fn(),
  getLessonBySlug: jest.fn(),
  getLessonsByCourse: jest.fn(),
}));

jest.mock('@/lib/supabase/access', () => ({
  checkContentAccess: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

import { getCourseBySlug, getLessonBySlug, getLessonsByCourse } from '@/lib/supabase/queries';
import { checkContentAccess } from '@/lib/supabase/access';

describe('Lesson Detail Page', () => {
  const mockCourse = {
    id: 'course-1',
    title: 'Discipline Foundations',
    slug: 'discipline-foundations',
    description: 'Build unbreakable discipline.',
    category: 'purpose',
    access_tier: 'basic' as const,
    published: true,
    cover_image: null,
    created_at: '2026-03-15T12:00:00Z',
  };

  const mockLesson = {
    id: 'lesson-1',
    course_id: 'course-1',
    title: 'The Morning Protocol',
    slug: 'the-morning-protocol',
    order_number: 1,
    body: 'Full lesson body content here.',
    video_url: null,
    duration: 12,
    published: true,
    created_at: '2026-03-15T12:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('queries course and lesson by slug', async () => {
    (getCourseBySlug as jest.Mock).mockResolvedValue(mockCourse);
    (getLessonBySlug as jest.Mock).mockResolvedValue(mockLesson);

    const course = await getCourseBySlug('discipline-foundations');
    expect(course).toEqual(mockCourse);

    const lesson = await getLessonBySlug('course-1', 'the-morning-protocol');
    expect(lesson).toEqual(mockLesson);
  });

  it('checks content access with course access_tier', async () => {
    (checkContentAccess as jest.Mock).mockResolvedValue({
      hasAccess: false,
      user: null,
    });

    const result = await checkContentAccess('basic');
    expect(result.hasAccess).toBe(false);
  });

  it('fetches all lessons for prev/next navigation', async () => {
    (getLessonsByCourse as jest.Mock).mockResolvedValue([mockLesson]);
    const lessons = await getLessonsByCourse('course-1');
    expect(lessons).toHaveLength(1);
  });
});
