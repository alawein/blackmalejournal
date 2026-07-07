import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getCourses } from '@/lib/supabase/queries';
import { StarDivider } from '@/components/ui/StarDivider';
import { EmptyState } from '@/components/ui/EmptyState';
import { CourseCard } from '@/components/content/CourseCard';
import { CategoryFilterTabs } from '@/components/content/CategoryFilterTabs';
import type { CourseCategory } from '@/lib/supabase/types';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Academy',
  description:
    'Structured learning for the disciplined man. Master your body, mind, and mission.',
  openGraph: {
    title: 'Academy',
    description:
      'Structured learning for the disciplined man. Master your body, mind, and mission.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Academy',
    description:
      'Structured learning for the disciplined man. Master your body, mind, and mission.',
  },
};

const VALID_CATEGORIES = new Set<string>([
  'martial-arts',
  'mental-health',
  'relationships',
  'purpose',
  'branding',
]);

interface AcademyPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function AcademyPage({ searchParams }: AcademyPageProps) {
  const { category: rawCategory } = await searchParams;

  const activeCategory = VALID_CATEGORIES.has(rawCategory ?? '')
    ? (rawCategory as CourseCategory)
    : undefined;

  const courses = await getCourses({
    category: activeCategory,
  });

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-5xl text-bmj-white">The Academy</h1>
      <p className="mt-2 max-w-xl font-body text-lg text-bmj-cream/70">
        Structured learning for the disciplined man. Master your body, mind, and
        mission.
      </p>
      <StarDivider className="mb-6" />

      <div className="mb-8">
        <Suspense fallback={<div className="h-10 border-b border-bmj-tan/20" />}>
          <CategoryFilterTabs activeCategory={activeCategory ?? 'all'} />
        </Suspense>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          heading="Courses coming soon"
          description="The Academy is being built. New courses on discipline, purpose, and mastery are on the way."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              title={course.title}
              slug={course.slug}
              category={course.category}
              description={course.description}
              accessTier={course.access_tier}
              published={course.published}
              coverImage={course.cover_image}
            />
          ))}
        </div>
      )}
    </div>
  );
}
