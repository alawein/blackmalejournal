import { SkeletonCard } from '@/components/ui/Skeleton';

export default function DownloadsLoading() {
  return (
    <div className="mx-auto max-w-content px-6 py-20">
      <div className="mb-12 space-y-4">
        <div className="h-12 w-48 animate-pulse bg-bmj-tan/10" />
        <div className="h-4 w-80 animate-pulse bg-bmj-tan/10" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
