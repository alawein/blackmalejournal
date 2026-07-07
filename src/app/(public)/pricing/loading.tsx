import { Skeleton } from '@/components/ui/Skeleton';

export default function PricingLoading() {
  return (
    <div className="mx-auto max-w-content px-6 py-20" aria-busy="true">
      <div className="mb-12 space-y-4 text-center">
        <Skeleton className="mx-auto h-12 w-48" />
        <Skeleton className="mx-auto h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-80 w-full" />
        ))}
      </div>
      <span className="sr-only" role="status">Loading…</span>
    </div>
  );
}
