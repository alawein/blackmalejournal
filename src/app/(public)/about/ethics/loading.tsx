import { Skeleton } from '@/components/ui/Skeleton';

export default function EthicsLoading() {
  return (
    <div className="mx-auto max-w-content px-6 py-20" aria-busy="true">
      <div className="mb-12 space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <span className="sr-only" role="status">Loading…</span>
    </div>
  );
}
