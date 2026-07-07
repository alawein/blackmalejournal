'use server';

import { PATHS } from '@/lib/paths';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createCourse, deleteCourse, getCourseById, updateCourse } from '@/lib/supabase/admin-queries';
import { requireAdminActor } from '@/lib/admin-auth';
import { generateSlug } from '@/lib/utils';

const courseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().optional(),
  description: z.string().min(1, 'Description is required').max(500),
  category: z.string().min(1, 'Category is required'),
  access_tier: z.enum(['free', 'basic', 'premium']).default('free'),
  published: z.coerce.boolean().default(false),
  cover_image: z.string().optional(),
});

export async function createCourseAction(formData: FormData): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const parsed = courseSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`${PATHS.ADMIN_COURSES}/new?error=${encodeURIComponent(firstError)}`);
  }

  const { title, slug, description, category, access_tier, published, cover_image } = parsed.data;
  const course = await createCourse({
    title,
    slug: slug?.trim() || generateSlug(title),
    description,
    category,
    access_tier,
    published,
    cover_image: cover_image?.trim() || null,
  });

  if (!course) {
    redirect(`${PATHS.ADMIN_COURSES}/new?error=Failed+to+create+course`);
  }

  revalidatePath(PATHS.ADMIN_COURSES);
  redirect(`${PATHS.ADMIN_COURSES}/${course.id}/edit?message=Course+created`);
}

export async function updateCourseAction(formData: FormData): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const id = formData.get('id') as string;

  if (!id) {
    redirect(`${PATHS.ADMIN_COURSES}?error=Course+ID+is+required`);
  }

  const parsed = courseSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
    redirect(`${PATHS.ADMIN_COURSES}/${id}/edit?error=${encodeURIComponent(firstError)}`);
  }

  const { title, slug, description, category, access_tier, published, cover_image } = parsed.data;
  const course = await updateCourse(id, {
    title,
    slug: slug?.trim() || generateSlug(title),
    description,
    category,
    access_tier,
    published,
    cover_image: cover_image?.trim() || null,
  });

  if (!course) {
    redirect(`${PATHS.ADMIN_COURSES}/${id}/edit?error=Failed+to+update+course`);
  }

  revalidatePath(PATHS.ADMIN_COURSES);
  revalidatePath(`${PATHS.ADMIN_COURSES}/${id}/edit`);
  redirect(`${PATHS.ADMIN_COURSES}/${id}/edit?message=Course+updated`);
}

export async function deleteCourseAction(formData: FormData): Promise<void> {
  await requireAdminActor(['admin', 'editor']);
  const id = formData.get('id') as string;

  if (!id) {
    redirect(`${PATHS.ADMIN_COURSES}?error=Course+ID+is+required`);
  }

  const existing = await getCourseById(id);
  if (!existing) {
    redirect(`${PATHS.ADMIN_COURSES}?error=Course+not+found`);
  }

  const deleted = await deleteCourse(id);
  if (!deleted) {
    redirect(`${PATHS.ADMIN_COURSES}/${id}/edit?error=Failed+to+delete+course`);
  }

  revalidatePath(PATHS.ADMIN_COURSES);
  redirect(`${PATHS.ADMIN_COURSES}?message=Course+deleted`);
}
