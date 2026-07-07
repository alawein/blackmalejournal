import {
  createMockSupabaseClient,
  setFromSequence,
  type MockSupabaseClient,
} from '../../helpers/supabase-mock';
import { mockCourse } from '../../helpers/fixtures';
import type { Lesson } from '@/lib/supabase/types';

// ── Module-level mock ────────────────────────────────────────────────────────
let mockClient: MockSupabaseClient;

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => mockClient),
}));

jest.spyOn(console, 'error').mockImplementation(() => {});

import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getLessonsForAdminCourse,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} from '@/lib/supabase/admin-queries/courses';

// ── Mock data ────────────────────────────────────────────────────────────────

const mockLesson: Lesson = {
  id: 'lesson-1',
  course_id: 'crs-1',
  title: 'Lesson One',
  slug: 'lesson-one',
  order_number: 1,
  body: 'Lesson body',
  video_url: null,
  duration: 42,
  published: true,
  created_at: '2026-03-01T00:00:00Z',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function resetClient(overrides: { data?: unknown; error?: { message: string } | null } = {}) {
  mockClient = createMockSupabaseClient(overrides);
}

function setData(data: unknown) {
  resetClient({ data });
}

function setError(message = 'test error') {
  resetClient({ error: { message } });
}

function setSingleData(data: unknown) {
  resetClient({ data });
  mockClient._queryChain.single.mockResolvedValue({ data, error: null });
}

function setSingleError(message = 'single failed') {
  resetClient();
  mockClient._queryChain.single.mockResolvedValue({ data: null, error: { message } });
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  resetClient();
});

// ── getAllCourses ────────────────────────────────────────────────────────────

describe('getAllCourses', () => {
  it('returns courses on success', async () => {
    setData([mockCourse]);
    const result = await getAllCourses();
    expect(result).toEqual([mockCourse]);
    expect(mockClient.from).toHaveBeenCalledWith('courses');
  });

  it('applies published and category filters', async () => {
    setData([mockCourse]);
    await getAllCourses({ published: true, category: 'martial-arts' });
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('published', true);
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('category', 'martial-arts');
  });

  it('applies search query filter', async () => {
    setData([mockCourse]);
    await getAllCourses({ query: 'martial' });
    expect(mockClient._queryChain.or).toHaveBeenCalledWith(
      expect.stringContaining('title.ilike.%martial%'),
    );
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getAllCourses();
    expect(result).toEqual([]);
  });
});

// ── getCourseById ───────────────────────────────────────────────────────────

describe('getCourseById', () => {
  it('returns course on success', async () => {
    setSingleData(mockCourse);
    const result = await getCourseById('crs-1');
    expect(result?.id).toBe('crs-1');
  });

  it('returns null on error', async () => {
    setSingleError('not found');
    const result = await getCourseById('missing');
    expect(result).toBeNull();
  });
});

// ── createCourse ────────────────────────────────────────────────────────────

describe('createCourse', () => {
  it('inserts course and returns it', async () => {
    setSingleData(mockCourse);
    const result = await createCourse({
      title: 'New Course',
      slug: 'new-course',
      description: 'Desc',
      category: 'purpose',
      access_tier: 'free',
      published: false,
    });
    expect(result?.id).toBe('crs-1');
    expect(mockClient.from).toHaveBeenCalledWith('courses');
  });

  it('returns null on error', async () => {
    setSingleError('insert failed');
    const result = await createCourse({
      title: 'Fail',
      slug: 'fail',
      description: 'Desc',
      category: 'purpose',
      access_tier: 'free',
      published: false,
    });
    expect(result).toBeNull();
  });
});

// ── updateCourse ────────────────────────────────────────────────────────────

describe('updateCourse', () => {
  it('updates course by id', async () => {
    setSingleData(mockCourse);
    const result = await updateCourse('crs-1', { published: true });
    expect(result?.published).toBe(true);
  });

  it('returns null on error', async () => {
    setSingleError('update failed');
    const result = await updateCourse('crs-1', { title: 'x' });
    expect(result).toBeNull();
  });
});

// ── deleteCourse ────────────────────────────────────────────────────────────

describe('deleteCourse', () => {
  it('deletes lessons first then course and returns true', async () => {
    resetClient();

    setFromSequence(mockClient, [
      { table: 'lessons', data: null },
      { table: 'courses', data: null },
    ]);

    const result = await deleteCourse('crs-1');
    expect(result).toBe(true);
  });

  it('returns false when lesson deletion fails', async () => {
    resetClient();

    setFromSequence(mockClient, [
      { table: 'lessons', error: { message: 'cannot delete lessons' } },
    ]);

    const result = await deleteCourse('crs-1');
    expect(result).toBe(false);
  });

  it('returns false when course deletion fails after lessons deleted', async () => {
    resetClient();

    setFromSequence(mockClient, [
      { table: 'lessons', data: null },
      { table: 'courses', error: { message: 'course delete failed' } },
    ]);

    const result = await deleteCourse('crs-1');
    expect(result).toBe(false);
  });
});

// ── getLessonsForAdminCourse ────────────────────────────────────────────────

describe('getLessonsForAdminCourse', () => {
  it('returns lessons ordered by order_number ASC', async () => {
    setData([mockLesson]);
    const result = await getLessonsForAdminCourse('crs-1');
    expect(result).toHaveLength(1);
    expect(mockClient._queryChain.eq).toHaveBeenCalledWith('course_id', 'crs-1');
    expect(mockClient._queryChain.order).toHaveBeenCalledWith('order_number', { ascending: true });
  });

  it('returns empty array on error', async () => {
    setError();
    const result = await getLessonsForAdminCourse('crs-1');
    expect(result).toEqual([]);
  });
});

// ── getLessonById ───────────────────────────────────────────────────────────

describe('getLessonById', () => {
  it('returns lesson on success', async () => {
    setSingleData(mockLesson);
    const result = await getLessonById('lesson-1');
    expect(result?.id).toBe('lesson-1');
  });

  it('returns null on error', async () => {
    setSingleError('not found');
    const result = await getLessonById('missing');
    expect(result).toBeNull();
  });
});

// ── createLesson ────────────────────────────────────────────────────────────

describe('createLesson', () => {
  it('inserts lesson with null video_url by default', async () => {
    setSingleData(mockLesson);
    await createLesson({
      course_id: 'crs-1',
      title: 'Lesson Two',
      slug: 'lesson-two',
      order_number: 2,
      body: 'Body',
      duration: 30,
      published: false,
    });
    expect(mockClient._queryChain.insert.mock.calls[0][0].video_url).toBeNull();
  });

  it('returns null on error', async () => {
    setSingleError('insert failed');
    const result = await createLesson({
      course_id: 'crs-1',
      title: 'Fail',
      slug: 'fail',
      order_number: 1,
      body: 'Body',
      duration: 10,
      published: false,
    });
    expect(result).toBeNull();
  });
});

// ── updateLesson ────────────────────────────────────────────────────────────

describe('updateLesson', () => {
  it('updates lesson by id', async () => {
    setSingleData({ ...mockLesson, published: false });
    const result = await updateLesson('lesson-1', { published: false });
    expect(result?.published).toBe(false);
  });

  it('returns null on error', async () => {
    setSingleError('update failed');
    const result = await updateLesson('lesson-1', { title: 'x' });
    expect(result).toBeNull();
  });
});

// ── deleteLesson ────────────────────────────────────────────────────────────

describe('deleteLesson', () => {
  it('deletes lesson by id and returns true', async () => {
    resetClient();
    const result = await deleteLesson('lesson-1');
    expect(result).toBe(true);
  });

  it('returns false on error', async () => {
    setError('lesson delete failed');
    const result = await deleteLesson('lesson-1');
    expect(result).toBe(false);
  });
});
