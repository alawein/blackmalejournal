'use server';

import { PATHS } from '@/lib/paths';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  createLesson,
  deleteLesson,
  getCourseById,
  getLessonById,
  updateLesson,
} from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';
import { generateSlug } from '@/lib/utils';

const lessonSchema = z.object({
  course_id: z.string().min(1, 'Course ID is required'),
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().optional(),
  order_number: z.coerce.number().int().min(1, 'Order number must be at least 1'),
  body: z.string().min(1, 'Body is required'),
  video_url: z.string().optional(),
  duration: z.coerce.number().int().min(0).default(0),
  published: z.coerce.boolean().default(false),
});

export async function createLessonAction(formData: FormData): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const parsed = lessonSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    const courseId = formData.get('course_id') as string;
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`${PATHS.ADMIN_COURSES}/${courseId}/lessons/new?error=${encodeURIComponent(firstError)}`);
  }

  const { course_id, title, slug, order_number, body, video_url, duration, published } = parsed.data;
  const lesson = await createLesson({
    course_id,
    title,
    slug: slug?.trim() || generateSlug(title),
    order_number,
    body,
    video_url: video_url?.trim() || null,
    duration,
    published,
  });

  if (!lesson) {
    redirect(`${PATHS.ADMIN_COURSES}/${course_id}/lessons/new?error=Failed+to+create+lesson`);
  }

  revalidatePath(`${PATHS.ADMIN_COURSES}/${course_id}/edit`);
  redirect(`${PATHS.ADMIN_COURSES}/${course_id}/lessons/${lesson.id}/edit?message=Lesson+created`);
}

export async function updateLessonAction(formData: FormData): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const id = formData.get('id') as string;

  if (!id) {
    redirect(`${PATHS.ADMIN_COURSES}?error=Lesson+ID+is+required`);
  }

  const parsed = lessonSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const courseId = formData.get('course_id') as string;
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`${PATHS.ADMIN_COURSES}/${courseId}/lessons/${id}/edit?error=${encodeURIComponent(firstError)}`);
  }

  const { course_id, title, slug, order_number, body, video_url, duration, published } = parsed.data;
  const lesson = await updateLesson(id, {
    title,
    slug: slug?.trim() || generateSlug(title),
    order_number,
    body,
    video_url: video_url?.trim() || null,
    duration,
    published,
  });

  if (!lesson) {
    redirect(`${PATHS.ADMIN_COURSES}/${course_id}/lessons/${id}/edit?error=Failed+to+update+lesson`);
  }

  revalidatePath(`${PATHS.ADMIN_COURSES}/${course_id}/edit`);
  revalidatePath(`${PATHS.ADMIN_COURSES}/${course_id}/lessons/${id}/edit`);
  redirect(`${PATHS.ADMIN_COURSES}/${course_id}/lessons/${id}/edit?message=Lesson+updated`);
}

export async function deleteLessonAction(formData: FormData): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const id = formData.get('id') as string;
  const courseId = formData.get('course_id') as string;

  if (!id || !courseId) {
    redirect(`${PATHS.ADMIN_COURSES}?error=Lesson+ID+is+required`);
  }

  const existing = await getLessonById(id);
  if (!existing) {
    redirect(`${PATHS.ADMIN_COURSES}/${courseId}/edit?error=Lesson+not+found`);
  }

  const course = await getCourseById(courseId);
  if (!course) {
    redirect(`${PATHS.ADMIN_COURSES}?error=Course+not+found`);
  }

  const deleted = await deleteLesson(id);
  if (!deleted) {
    redirect(`${PATHS.ADMIN_COURSES}/${courseId}/lessons/${id}/edit?error=Failed+to+delete+lesson`);
  }

  revalidatePath(`${PATHS.ADMIN_COURSES}/${courseId}/edit`);
  redirect(`${PATHS.ADMIN_COURSES}/${courseId}/edit?message=Lesson+deleted`);
}
