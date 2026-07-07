import { Skeleton, SkeletonDispatchCard } from '@/components/ui/Skeleton';

export default function DispatchesLoading() {
  return (
    <div className="mx-auto max-w-content px-6 py-20" aria-busy="true">
      <div className="mb-12 space-y-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="mx-auto max-w-article space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonDispatchCard key={i} />
        ))}
      </div>
      <span className="sr-only" role="status">Loading dispatches…</span>
    </div>
  );
}
