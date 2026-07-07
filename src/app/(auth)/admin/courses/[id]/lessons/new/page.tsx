import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PATHS } from '@/lib/paths';
import { getCourseById } from '@/lib/supabase/admin-queries';
import { LessonForm } from '../../../../courses/LessonForm';
import { createLessonAction } from '../../../../courses/lessons/actions';

export const metadata: Metadata = {
  title: 'New Lesson — Admin',
  robots: { index: false, follow: false },
};

interface NewLessonPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function NewLessonPage({ params, searchParams }: NewLessonPageProps) {
  const { id } = await params;
  const { error } = await searchParams;
  const course = await getCourseById(id);

  if (!course) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={`${PATHS.ADMIN_COURSES}/${course.id}/edit`}
        className="mb-6 inline-block font-label text-xs uppercase tracking-widest text-bmj-tan hover:text-bmj-cream"
      >
        &larr; Back to Course
      </Link>

      <h1 className="mb-8 font-display text-4xl text-bmj-white">NEW LESSON</h1>

      {error && (
        <div className="mb-6 border border-bmj-red/40 bg-bmj-red/10 p-4">
          <p className="font-body text-sm text-bmj-red">{error}</p>
        </div>
      )}

      <LessonForm courseId={course.id} action={createLessonAction} />
    </div>
  );
}
