import { Skeleton } from '@/components/ui/Skeleton';

export default function HandbookDetailLoading() {
  return (
    <div className="mx-auto max-w-article px-6 py-20" aria-busy="true">
      <Skeleton className="mb-4 h-3 w-48" />
      <Skeleton className="mb-6 h-12 w-3/4" />
      <Skeleton className="mb-8 h-64 w-full" />
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      <span className="sr-only" role="status">Loading…</span>
    </div>
  );
}
