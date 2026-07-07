import { createAdminClient } from '@/lib/supabase/admin';
import type {
  Course,
  Lesson,
  AccessTier,
} from '@/lib/supabase/types';
import {
  buildSearchPattern,
} from './shared';

// ── Courses ────────────────────────────────────────────────────────────────────

export async function getAllCourses(options?: {
  published?: boolean;
  category?: string;
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<Course[]> {
  const { published, category, query, limit = 50, offset = 0 } = options ?? {};
  const supabase = createAdminClient();
  const searchPattern = buildSearchPattern(query);

  let search = supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (published !== undefined) search = search.eq('published', published);
  if (category) search = search.eq('category', category);
  if (searchPattern) {
    search = search.or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`);
  }

  const { data, error } = await search;
  if (error) {
    console.error('[getAllCourses]', error.message);
    return [];
  }
  return (data ?? []) as Course[];
}

export async function getCourseById(id: string): Promise<Course | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getCourseById]', error.message);
    return null;
  }
  return data as Course;
}

export async function createCourse(data: {
  title: string;
  slug: string;
  description: string;
  category: string;
  access_tier: AccessTier;
  published: boolean;
  cover_image?: string | null;
}): Promise<Course | null> {
  const supabase = createAdminClient();
  const { data: created, error } = await supabase
    .from('courses')
    .insert({
      title: data.title,
      slug: data.slug,
      description: data.description,
      category: data.category,
      access_tier: data.access_tier,
      published: data.published,
      cover_image: data.cover_image ?? null,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[createCourse]', error.message);
    return null;
  }
  return created as Course;
}

export async function updateCourse(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    description: string;
    category: string;
    access_tier: AccessTier;
    published: boolean;
    cover_image: string | null;
  }>,
): Promise<Course | null> {
  const supabase = createAdminClient();
  const { data: updated, error } = await supabase
    .from('courses')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[updateCourse]', error.message);
    return null;
  }
  return updated as Course;
}

export async function deleteCourse(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error: lessonError } = await supabase
    .from('lessons')
    .delete()
    .eq('course_id', id);

  if (lessonError) {
    console.error('[deleteCourse:lessons]', lessonError.message);
    return false;
  }

  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteCourse]', error.message);
    return false;
  }
  return true;
}

// ── Lessons ────────────────────────────────────────────────────────────────────

export async function getLessonsForAdminCourse(courseId: string): Promise<Lesson[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('order_number', { ascending: true });

  if (error) {
    console.error('[getLessonsForAdminCourse]', error.message);
    return [];
  }
  return (data ?? []) as Lesson[];
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getLessonById]', error.message);
    return null;
  }
  return data as Lesson;
}

export async function createLesson(data: {
  course_id: string;
  title: string;
  slug: string;
  order_number: number;
  body: string;
  video_url?: string | null;
  duration: number;
  published: boolean;
}): Promise<Lesson | null> {
  const supabase = createAdminClient();
  const { data: created, error } = await supabase
    .from('lessons')
    .insert({
      course_id: data.course_id,
      title: data.title,
      slug: data.slug,
      order_number: data.order_number,
      body: data.body,
      video_url: data.video_url ?? null,
      duration: data.duration,
      published: data.published,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[createLesson]', error.message);
    return null;
  }
  return created as Lesson;
}

export async function updateLesson(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    order_number: number;
    body: string;
    video_url: string | null;
    duration: number;
    published: boolean;
  }>,
): Promise<Lesson | null> {
  const supabase = createAdminClient();
  const { data: updated, error } = await supabase
    .from('lessons')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[updateLesson]', error.message);
    return null;
  }
  return updated as Lesson;
}

export async function deleteLesson(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteLesson]', error.message);
    return false;
  }
  return true;
}

