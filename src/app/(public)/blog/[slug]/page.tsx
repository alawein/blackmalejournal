import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getDispatchBySlug } from '@/lib/supabase/queries';
import { formatDate } from '@/lib/utils';
import { articleJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { LensBadge } from '@/components/brand/LensBadge';
import { StarDivider } from '@/components/ui/StarDivider';
import { ArticleBody } from '@/components/content/ArticleBody';
import { BookmarkButton } from '@/components/content/BookmarkButton';
import { isBookmarked } from '@/lib/supabase/bookmarks';
import { getAuthUser } from '@/lib/supabase/access';
import { ShareButton } from '@/components/ui/ShareButton';
import { dispatchPath, PATHS, siteAbsoluteUrl } from '@/lib/paths';
import { IMAGE_SIZES } from '@/lib/images';

interface DispatchPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: DispatchPageProps,
): Promise<Metadata> {
  const { slug } = await params;
  const dispatch = await getDispatchBySlug(slug);
  if (!dispatch) return { title: 'Dispatch Not Found' };

  return {
    title: dispatch.title,
    description: dispatch.excerpt,
    openGraph: {
      title: dispatch.title,
      description: dispatch.excerpt,
      images: dispatch.cover_image ? [{ url: dispatch.cover_image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: dispatch.title,
      description: dispatch.excerpt,
    },
  };
}

export default async function DispatchPage({ params }: DispatchPageProps) {
  const { slug } = await params;
  const dispatch = await getDispatchBySlug(slug);
  if (!dispatch) notFound();

  const user = await getAuthUser();
  const bookmarked = user
    ? await isBookmarked(user.id, 'dispatch', dispatch.id)
    : false;

  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
      <JsonLd
        data={articleJsonLd({
          title: dispatch.title,
          description: dispatch.excerpt,
          url: siteAbsoluteUrl(dispatchPath(dispatch.slug)),
          imageUrl: dispatch.cover_image,
          publishedAt: dispatch.published_at,
          author: dispatch.author,
        })}
      />

      {/* Back link */}
      <Link
        href={PATHS.BLOG}
        className="font-label text-xs uppercase tracking-widest text-bmj-tan hover:text-bmj-cream"
      >
        &larr; All Dispatches
      </Link>

      {/* Header */}
      <header className="mt-8">
        <div className="mb-4 flex items-center gap-4">
          <LensBadge lens={dispatch.lens} />
          <span className="font-mono text-xs text-bmj-tan">
            {formatDate(dispatch.published_at)}
          </span>
          <BookmarkButton
            contentType="dispatch"
            contentId={dispatch.id}
            initialBookmarked={bookmarked}
            isLoggedIn={!!user}
          />
        </div>

        <h1 className="mb-4 font-display text-4xl leading-tight text-bmj-white sm:text-5xl">
          {dispatch.title}
        </h1>

        <p className="mb-6 font-body text-lg italic leading-relaxed text-bmj-tan">
          {dispatch.excerpt}
        </p>

        <div className="accent-border-bottom mb-0 pb-0" />
      </header>

      {/* Cover image (optional) */}
      {dispatch.cover_image && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden bg-bmj-black">
          <Image
            src={dispatch.cover_image}
            alt={dispatch.title}
            fill
            className="halftone object-cover"
            priority
            sizes={IMAGE_SIZES.hero}
          />
        </div>
      )}

      {/* Body */}
      <div className="py-12">
        <ArticleBody body={dispatch.body} />
      </div>

      {/* Share */}
      <StarDivider className="mb-6" />
      <ShareButton />
    </div>
  );
}
