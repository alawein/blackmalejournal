'use client';

import { useState } from 'react';
import type { Video } from '@/lib/content/videos';
import { VideoCard } from '@/components/content/VideoCard';
import { VideoModal } from '@/components/content/VideoModal';

interface VideoGalleryProps {
  videos: Video[];
}

export function VideoGallery({ videos }: VideoGalleryProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  if (videos.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-label text-bmj-tan">No videos available yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <button
            key={video.id}
            type="button"
            onClick={() => setSelectedVideo(video)}
            className="cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-bmj-red"
          >
            <VideoCard
              title={video.title}
              youtubeId={video.youtubeId}
              publishedAt={video.publishedAt}
            />
          </button>
        ))}
      </div>

      <VideoModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </>
  );
}
