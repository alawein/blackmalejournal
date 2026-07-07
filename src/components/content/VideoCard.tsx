import Image from 'next/image';
import { IMAGE_SIZES } from '@/lib/images';
import { formatDate } from '@/lib/utils';

interface VideoCardProps {
  title: string;
  youtubeId: string;
  publishedAt: string;
}

export function VideoCard({ title, youtubeId, publishedAt }: VideoCardProps) {
  return (
    <article className="group flex flex-col surface-panel hover-lift hover:border-bmj-red/40">
      {/* Thumbnail with play overlay */}
      <div className="relative aspect-[16/9] overflow-hidden bg-bmj-black">
        <Image
          src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
          alt={title}
          fill
          className="halftone object-cover"
          sizes={IMAGE_SIZES.card}
        />
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bmj-red transition-transform duration-200 group-hover:scale-110">
            <svg
              width="20"
              height="24"
              viewBox="0 0 20 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="ml-1"
            >
              <path d="M0 0L20 12L0 24V0Z" fill="var(--bmj-white)" />
            </svg>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="mb-3 line-clamp-2 font-display text-xl uppercase tracking-display leading-tight text-bmj-white">
          {title}
        </h3>
        <span className="font-mono text-xs text-bmj-tan">
          {formatDate(publishedAt)}
        </span>
      </div>
    </article>
  );
}
