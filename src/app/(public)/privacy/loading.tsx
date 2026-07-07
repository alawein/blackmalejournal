import { Skeleton } from '@/components/ui/Skeleton';

export default function PrivacyLoading() {
  return (
    <div className="mx-auto max-w-article px-6 py-20" aria-busy="true">
      <div className="mb-12 space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      <span className="sr-only" role="status">Loading…</span>
    </div>
  );
}
