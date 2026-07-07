import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { CourseForm } from '../../CourseForm';
import { deleteCourseAction, updateCourseAction } from '../../actions';
import { PATHS } from '@/lib/paths';
import { getCourseById, getLessonsForAdminCourse } from '@/lib/supabase/admin-queries';

export const metadata: Metadata = {
  title: 'Edit Course — Admin',
  robots: { index: false, follow: false },
};

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
}

export default async function EditCoursePage({ params, searchParams }: EditCoursePageProps) {
  const { id } = await params;
  const { error, message } = await searchParams;
  const [course, lessons] = await Promise.all([
    getCourseById(id),
    getLessonsForAdminCourse(id),
  ]);

  if (!course) notFound();

  async function deleteAction() {
    'use server';
    const formData = new FormData();
    formData.set('id', id);
    await deleteCourseAction(formData);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={PATHS.ADMIN_COURSES}
        className="mb-6 inline-block font-label text-xs uppercase tracking-widest text-bmj-tan hover:text-bmj-cream"
      >
        &larr; Back to Courses
      </Link>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-bmj-white">EDIT COURSE</h1>
          <p className="mt-2 font-mono text-sm text-bmj-tan">{course.title}</p>
        </div>
        <DeleteButton action={deleteAction} itemName="course" />
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

      <CourseForm course={course} action={updateCourseAction} />

      <section className="mt-10 border border-bmj-tan/20 bg-bmj-brown p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-bmj-white">LESSONS</h2>
            <p className="mt-1 font-mono text-sm text-bmj-tan">
              {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
            </p>
          </div>
          <Link
            href={`${PATHS.ADMIN_COURSES}/${course.id}/lessons/new`}
            className="inline-flex items-center gap-2 bg-bmj-red px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
          >
            <Plus size={16} />
            New Lesson
          </Link>
        </div>

        <div className="mt-6">
          {lessons.length === 0 ? (
            <p className="font-body text-sm text-bmj-tan">
              No lessons yet. Add the first lesson to start building the course.
            </p>
          ) : (
            <ul>
              {lessons.map((lesson) => (
                <li key={lesson.id} className="flex items-center justify-between border-b border-bmj-tan/10 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`inline-block px-2 py-0.5 font-label text-micro uppercase tracking-widest ${
                        lesson.published ? 'bg-bmj-red/20 text-bmj-red' : 'bg-bmj-tan/20 text-bmj-tan'
                      }`}>
                        {lesson.published ? 'published' : 'draft'}
                      </span>
                      <h3 className="truncate font-display text-lg text-bmj-white">{lesson.title}</h3>
                    </div>
                    <p className="mt-1 font-mono text-xs text-bmj-tan">
                      Lesson {String(lesson.order_number).padStart(2, '0')} &middot; {lesson.duration} min
                    </p>
                  </div>
                  <Link
                    href={`${PATHS.ADMIN_COURSES}/${course.id}/lessons/${lesson.id}/edit`}
                    className="ml-4 shrink-0 font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-red"
                  >
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
