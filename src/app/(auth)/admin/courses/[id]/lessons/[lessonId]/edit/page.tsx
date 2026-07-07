import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { PATHS } from '@/lib/paths';
import { getCourseById, getLessonById } from '@/lib/supabase/admin-queries';
import { LessonForm } from '../../../../LessonForm';
import { deleteLessonAction, updateLessonAction } from '../../../../lessons/actions';

export const metadata: Metadata = {
  title: 'Edit Lesson — Admin',
  robots: { index: false, follow: false },
};

interface EditLessonPageProps {
  params: Promise<{ id: string; lessonId: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
}

export default async function EditLessonPage({ params, searchParams }: EditLessonPageProps) {
  const { id, lessonId } = await params;
  const { error, message } = await searchParams;
  const [course, lesson] = await Promise.all([
    getCourseById(id),
    getLessonById(lessonId),
  ]);

  if (!course || !lesson || lesson.course_id !== course.id) notFound();
  const courseRecord = course;
  const lessonRecord = lesson;

  async function deleteAction() {
    'use server';
    const formData = new FormData();
    formData.set('id', lessonRecord.id);
    formData.set('course_id', courseRecord.id);
    await deleteLessonAction(formData);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={`${PATHS.ADMIN_COURSES}/${courseRecord.id}/edit`}
        className="mb-6 inline-block font-label text-xs uppercase tracking-widest text-bmj-tan hover:text-bmj-cream"
      >
        &larr; Back to Course
      </Link>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-bmj-white">EDIT LESSON</h1>
          <p className="mt-2 font-mono text-sm text-bmj-tan">{lessonRecord.title}</p>
        </div>
        <DeleteButton action={deleteAction} itemName="lesson" />
      </div>

      {error && (
        <div className="mb-6 border border-bmj-red/40 bg-bmj-red/10 p-4">
          <p className="font-body text-sm text-bmj-red">{error}</p>
        </div>
      )}

      {message && (
        <div className="mb-6 border border-bmj-amber/40 bg-bmj-amber/10 p-4">
          <p className="font-body text-sm text-bmj-amber">{message}</p>
        </div>
      )}

      <LessonForm courseId={courseRecord.id} lesson={lessonRecord} action={updateLessonAction} />
    </div>
  );
}
