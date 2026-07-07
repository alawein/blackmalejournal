import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AdminContentThumbnail } from '@/components/admin/AdminContentThumbnail';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PATHS, adminEditPath, withQuery } from '@/lib/paths';
import { getAllCourses } from '@/lib/supabase/admin-queries';

export const metadata: Metadata = {
  title: 'Courses — Admin',
  robots: { index: false, follow: false },
};

interface CoursesAdminPageProps {
  searchParams: Promise<{ published?: string; q?: string; message?: string; error?: string }>;
}

export default async function CoursesAdminPage({ searchParams }: CoursesAdminPageProps) {
  const { published, q, message, error } = await searchParams;
  const activePublished =
    published === 'published' ? true : published === 'draft' ? false : undefined;
  const courses = await getAllCourses({
    published: activePublished,
    query: q,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-widest text-bmj-white">COURSES</h1>
          <p className="mt-1 font-mono text-sm text-bmj-tan">
            {courses.length} {courses.length === 1 ? 'course' : 'courses'}
          </p>
        </div>
        <Link
          href={PATHS.ADMIN_COURSES_NEW}
          className="inline-flex items-center gap-2 bg-bmj-red px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          New Course
        </Link>
      </div>

      {error && (
        <div className="mt-6 border border-bmj-red/40 bg-bmj-red/10 p-4">
          <p className="font-body text-sm text-bmj-red">{error}</p>
        </div>
      )}

      {message && (
        <div className="mt-6 border border-bmj-amber/40 bg-bmj-amber/10 p-4">
          <p className="font-body text-sm text-bmj-amber">{message}</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-6 border-b border-bmj-tan/20">
        <Link
          href={withQuery(PATHS.ADMIN_COURSES, { q: q || undefined })}
          className={`pb-3 font-label text-xs uppercase tracking-widest transition-colors ${
            activePublished === undefined
              ? 'border-b-2 border-bmj-red text-bmj-white'
              : 'text-bmj-tan hover:text-bmj-cream'
          }`}
        >
          All
        </Link>
        <Link
          href={withQuery(PATHS.ADMIN_COURSES, { published: 'published', q: q || undefined })}
          className={`pb-3 font-label text-xs uppercase tracking-widest transition-colors ${
            activePublished === true
              ? 'border-b-2 border-bmj-red text-bmj-white'
              : 'text-bmj-tan hover:text-bmj-cream'
          }`}
        >
          Published
        </Link>
        <Link
          href={withQuery(PATHS.ADMIN_COURSES, { published: 'draft', q: q || undefined })}
          className={`pb-3 font-label text-xs uppercase tracking-widest transition-colors ${
            activePublished === false
              ? 'border-b-2 border-bmj-red text-bmj-white'
              : 'text-bmj-tan hover:text-bmj-cream'
          }`}
        >
          Draft
        </Link>
      </div>

      <form className="mt-6 flex gap-3 border border-bmj-tan/20 bg-bmj-brown p-4">
        {published && <input type="hidden" name="published" value={published} />}
        <input
          type="text"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Search course title or description"
          className="min-w-0 flex-1 border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream placeholder:text-bmj-tan/50 focus:border-bmj-red focus:outline-none"
        />
        <button
          type="submit"
          className="bg-bmj-red px-5 py-3 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
        >
          Search
        </button>
      </form>

      <div className="mt-6">
        {courses.length === 0 ? (
          <p className="py-12 text-center font-body text-bmj-tan">
            No courses found. Create your first course.
          </p>
        ) : (
          <ul>
            {courses.map((course) => (
              <li key={course.id} className="flex items-center gap-4 border-b border-bmj-tan/10 py-4">
                <AdminContentThumbnail
                  src={course.cover_image}
                  alt={course.title}
                  type="course"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={course.published ? 'published' : 'draft'} />
                    <h2 className="truncate font-display text-lg text-bmj-white">{course.title}</h2>
                  </div>
                  <p className="mt-1 font-mono text-xs text-bmj-tan">
                    {course.category} &middot; {course.access_tier}
                  </p>
                </div>
                <Link
                  href={adminEditPath('courses', course.id)}
                  className="ml-4 shrink-0 font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-red"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
