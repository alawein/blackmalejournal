import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Course, Lesson } from '@/lib/supabase/types';
import { fetchRows, fetchSingle } from './_shared';

const COURSE_LIST_SELECT =
  'id,title,slug,description,category,access_tier,published,cover_image,created_at';

export async function getCourses(
  options: { category?: string; published?: boolean } = {},
): Promise<Course[]> {
  const { category, published } = options;
  const supabase = await createClient();

  let query = supabase
    .from('courses')
    .select(COURSE_LIST_SELECT)
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category', category);
  if (published !== undefined) query = query.eq('published', published);

  return fetchRows<Course>(query, 'getCourses');
}

export const getCourseBySlug = cache(async function getCourseBySlug(
  slug: string,
): Promise<Course | null> {
  const supabase = await createClient();
  const query = supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single();

  return fetchSingle<Course>(query, 'getCourseBySlug');
});

export async function getLessonsByCourse(courseId: string): Promise<Lesson[]> {
  const supabase = await createClient();
  const query = supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .eq('published', true)
    .order('order_number', { ascending: true });

  return fetchRows<Lesson>(query, 'getLessonsByCourse');
}

export const getLessonBySlug = cache(async function getLessonBySlug(
  courseId: string,
  lessonSlug: string,
): Promise<Lesson | null> {
  const supabase = await createClient();
  const query = supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .eq('slug', lessonSlug)
    .eq('published', true)
    .single();

  return fetchSingle<Lesson>(query, 'getLessonBySlug');
});
