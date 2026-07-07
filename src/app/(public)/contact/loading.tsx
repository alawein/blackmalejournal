import { Skeleton } from '@/components/ui/Skeleton';

export default function ContactLoading() {
  return (
    <div className="mx-auto max-w-content px-6 py-20" aria-busy="true">
      <div className="mb-12 space-y-4">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="mx-auto max-w-md space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
      <span className="sr-only" role="status">Loading…</span>
    </div>
  );
}
