import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-bmj-tan/10', className)}
      aria-hidden="true"
      {...props}
    />
  );
}

/** Article card skeleton — matches ArticleCard dimensions */
export function SkeletonCard(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="card-media border-t-bmj-tan/20" {...props}>
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-5 w-16 rounded-sm" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex justify-between border-t border-bmj-tan/10 pt-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

/** Briefing card skeleton — matches BriefingCard dimensions */
export function SkeletonBriefingCard(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="card-stripe border border-bmj-tan/10 border-l-bmj-red/30 p-6 sm:p-8" {...props}>
      <div className="mb-4 flex items-center gap-4">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="mt-3 h-3 w-full" />
    </div>
  );
}

/** Dispatch card skeleton — matches DispatchCard dimensions */
export function SkeletonDispatchCard(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="card-stripe border border-bmj-tan/10 border-l-bmj-tan/30 p-6 sm:p-8" {...props}>
      <div className="mb-3 flex items-center gap-4">
        <Skeleton className="h-5 w-20 rounded-sm" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="mb-3 h-7 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

/** Handbook card skeleton — matches HandbookCard dimensions */
export function SkeletonHandbookCard(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="card-media flex flex-col border-t-bmj-tan/20 sm:flex-row" {...props}>
      <Skeleton className="aspect-[4/3] w-full sm:aspect-auto sm:w-48 sm:shrink-0" />
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-3">
          <Skeleton className="h-5 w-20 rounded-sm" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="mb-2 h-6 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="mt-4 border-t border-bmj-tan/10 pt-3">
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

/** Course card skeleton — matches CourseCard dimensions */
export function SkeletonCourseCard(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="card-media border-t-bmj-tan/20" {...props}>
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-5 w-20 rounded-sm" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="border-t border-bmj-tan/10 pt-4">
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

/** Grid of skeleton cards */
export function SkeletonCardGrid({
  count = 6,
  columns = 3,
}: {
  count?: number;
  columns?: 2 | 3;
}) {
  const colClass =
    columns === 2
      ? 'grid grid-cols-1 gap-6 sm:grid-cols-2'
      : 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={colClass}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
