import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCourseBySlug, getLessonsByCourse } from '@/lib/supabase/queries';
import { checkContentAccess } from '@/lib/supabase/access';
import { getCategoryLabel } from '@/lib/utils';
import { StarDivider } from '@/components/ui/StarDivider';
import { LessonCard } from '@/components/content/LessonCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo';
import { academyCoursePath, PATHS, siteAbsoluteUrl } from '@/lib/paths';
import { IMAGE_SIZES } from '@/lib/images';

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: CoursePageProps,
): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: 'Course Not Found' };

  return {
    title: course.title,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      images: course.cover_image ? [{ url: course.cover_image }] : [],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: course.title,
      description: course.description,
      images: course.cover_image ? [course.cover_image] : [],
    },
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const lessons = course.published
    ? await getLessonsByCourse(course.id)
    : [];

  const { hasAccess } = course.access_tier === 'free'
    ? { hasAccess: true }
    : await checkContentAccess(course.access_tier);

  return (
    <div className="mx-auto max-w-article px-4 py-16 sm:px-6 lg:px-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Academy', url: siteAbsoluteUrl(PATHS.ACADEMY) },
          { name: course.title, url: siteAbsoluteUrl(academyCoursePath(course.slug)) },
        ])}
      />
      <span className="inline-block rounded-sm border border-bmj-tan/40 px-2 py-0.5 font-label text-xs uppercase tracking-widest text-bmj-tan">
        {getCategoryLabel(course.category)}
      </span>

      <h1 className="mt-4 font-display text-5xl text-bmj-white">
        {course.title}
      </h1>

      <p className="mt-6 font-body text-lg leading-relaxed text-bmj-cream/80">
        {course.description}
      </p>

      {course.cover_image && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden bg-bmj-black">
          <Image
            src={course.cover_image}
            alt={course.title}
            fill
            priority
            className="halftone object-cover"
            sizes={IMAGE_SIZES.hero}
          />
        </div>
      )}

      <StarDivider className="my-10" />

      {/* Lessons or status message */}
      {!course.published ? (
        <p className="font-body italic text-bmj-tan">
          This course is currently in development. Check back soon.
        </p>
      ) : lessons.length === 0 ? (
        <p className="font-body italic text-bmj-tan">
          Lessons are being prepared. Check back soon.
        </p>
      ) : (
        <section>
          <h2 className="mb-6 font-display text-2xl text-bmj-white">
            LESSONS ({lessons.length})
          </h2>
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                title={lesson.title}
                slug={lesson.slug}
                courseSlug={course.slug}
                orderNumber={lesson.order_number}
                duration={lesson.duration}
                hasAccess={hasAccess}
                hasVideo={!!lesson.video_url}
                courseCoverImage={course.cover_image}
                accentBorderClass="border-l-4 border-l-bmj-red"
              />
            ))}
          </div>
        </section>
      )}

      <div className="mt-10">
        <Link
          href={PATHS.ACADEMY}
          className="font-label text-sm uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-cream"
        >
          &larr; Back to Academy
        </Link>
      </div>
    </div>
  );
}
