import { Skeleton, SkeletonBriefingCard } from '@/components/ui/Skeleton';

export default function BriefingsLoading() {
  return (
    <div className="mx-auto max-w-content px-6 py-20" aria-busy="true">
      <div className="mb-12 space-y-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-12 w-64" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBriefingCard key={i} />
        ))}
      </div>
      <span className="sr-only" role="status">Loading briefings…</span>
    </div>
  );
}
