import type { Metadata } from 'next';
import { StarDivider } from '@/components/ui/StarDivider';
import { videos } from '@/lib/content/videos';
import { VideoGallery } from './VideoGallery';

export const metadata: Metadata = {
  title: 'Video',
  description:
    'Watch. Learn. Build. Video content from The Chairman across five lenses of Black male life.',
  openGraph: {
    title: 'Video',
    description:
      'Watch. Learn. Build. Video content from The Chairman across five lenses of Black male life.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Video',
    description:
      'Watch. Learn. Build. Video content from The Chairman across five lenses of Black male life.',
  },
};

export default function VideoPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-5xl text-bmj-white">Video</h1>
      <p className="mt-2 max-w-xl font-body text-lg text-bmj-cream/70">
        Watch. Learn. Build.
      </p>
      <StarDivider className="mb-6" />

      <VideoGallery videos={videos} />
    </div>
  );
}
