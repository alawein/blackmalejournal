import type { Metadata } from 'next';
import Link from 'next/link';
import { PATHS } from '@/lib/paths';
import { CourseForm } from '../CourseForm';
import { createCourseAction } from '../actions';

export const metadata: Metadata = {
  title: 'New Course — Admin',
  robots: { index: false, follow: false },
};

interface NewCoursePageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewCoursePage({ searchParams }: NewCoursePageProps) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={PATHS.ADMIN_COURSES}
        className="mb-6 inline-block font-label text-xs uppercase tracking-widest text-bmj-tan hover:text-bmj-cream"
      >
        &larr; Back to Courses
      </Link>

      <h1 className="mb-8 font-display text-4xl text-bmj-white">NEW COURSE</h1>

      {error && (
        <div className="mb-6 border border-bmj-red/40 bg-bmj-red/10 p-4">
          <p className="font-body text-sm text-bmj-red">{error}</p>
        </div>
      )}

      <CourseForm action={createCourseAction} />
    </div>
  );
}
