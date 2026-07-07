import { Skeleton, SkeletonCourseCard } from '@/components/ui/Skeleton';

export default function AcademyLoading() {
  return (
    <div className="mx-auto max-w-content px-6 py-20" aria-busy="true">
      <div className="mb-12 space-y-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCourseCard key={i} />
        ))}
      </div>
      <span className="sr-only" role="status">Loading courses…</span>
    </div>
  );
}
