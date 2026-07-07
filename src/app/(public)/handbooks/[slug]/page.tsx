import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { getHandbookBySlug } from '@/lib/supabase/queries';
import { checkContentAccess, getAuthUser } from '@/lib/supabase/access';
import { calculateReadingTime } from '@/lib/utils';
import { LensBadge } from '@/components/brand/LensBadge';
import { StarDivider } from '@/components/ui/StarDivider';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ArticleBody } from '@/components/content/ArticleBody';
import { BookmarkButton } from '@/components/content/BookmarkButton';
import { isBookmarked } from '@/lib/supabase/bookmarks';
import { PaywallGate } from '@/components/content/PaywallGate';
import { JsonLd } from '@/components/seo/JsonLd';
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { handbookPath, PATHS, siteAbsoluteUrl } from '@/lib/paths';
import { IMAGE_SIZES } from '@/lib/images';

interface HandbookPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: HandbookPageProps,
): Promise<Metadata> {
  const { slug } = await params;
  const handbook = await getHandbookBySlug(slug);
  if (!handbook) return { title: 'Handbook Not Found' };

  return {
    title: handbook.title,
    description: handbook.description,
    openGraph: {
      title: handbook.title,
      description: handbook.description,
      images: handbook.cover_image ? [{ url: handbook.cover_image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: handbook.title,
      description: handbook.description,
      images: handbook.cover_image ? [handbook.cover_image] : [],
    },
  };
}

export default async function HandbookPage({ params }: HandbookPageProps) {
  const { slug } = await params;
  const handbook = await getHandbookBySlug(slug);
  if (!handbook) notFound();

  const { hasAccess, user } = await checkContentAccess(handbook.access_tier);

  const authUser = await getAuthUser();
  const bookmarked = authUser
    ? await isBookmarked(authUser.id, 'handbook', handbook.id)
    : false;

  const readingTime = calculateReadingTime(handbook.body);
  const previewBody = handbook.body.slice(0, 300);

  const formattedDate = new Date(handbook.published_at).toLocaleDateString(
    'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' },
  );

  return (
    <div className="mx-auto max-w-wide">
      <JsonLd
        data={articleJsonLd({
          title: handbook.title,
          description: handbook.description,
          url: siteAbsoluteUrl(handbookPath(handbook.slug)),
          imageUrl: handbook.cover_image,
          publishedAt: handbook.published_at,
          author: handbook.author,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Handbooks', url: siteAbsoluteUrl(PATHS.HANDBOOKS) },
          { name: handbook.title, url: siteAbsoluteUrl(handbookPath(handbook.slug)) },
        ])}
      />
      <div className="mx-auto max-w-content px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Handbooks', href: PATHS.HANDBOOKS },
            { label: handbook.title },
          ]}
        />
      </div>

      {/* Header */}
      <header className="mx-auto max-w-content px-4 pt-8 sm:px-6 lg:px-8">
        <LensBadge lens={handbook.lens} className="mb-4" />

        <h1 className="mb-4 font-display text-4xl leading-tight text-bmj-white sm:text-5xl lg:text-6xl">
          {handbook.title}
        </h1>

        <p className="mb-6 font-body text-xl italic leading-relaxed text-bmj-tan">
          {handbook.description}
        </p>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <span className="font-label text-xs uppercase tracking-widest text-bmj-cream/80">
            By {handbook.author}
          </span>
          <span className="font-mono text-xs text-bmj-tan">
            {formattedDate} · {readingTime} min read
          </span>
          <BookmarkButton
            contentType="handbook"
            contentId={handbook.id}
            initialBookmarked={bookmarked}
            isLoggedIn={!!authUser}
          />
        </div>

        <div className="accent-border-bottom mb-0 pb-0" />
      </header>

      {/* Cover image */}
      {handbook.cover_image && (
        <div className="relative mt-8 h-64 w-full overflow-hidden sm:h-96 lg:h-[32rem]">
          <Image
            src={handbook.cover_image}
            alt={handbook.title}
            fill
            className="halftone-heavy object-cover"
            priority
            sizes={IMAGE_SIZES.hero}
          />
        </div>
      )}

      {/* Body or paywall */}
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        {hasAccess ? (
          <>
            <ArticleBody body={handbook.body} />

            {/* Download button */}
            {handbook.file_url && (
              <div className="mt-10">
                <a
                  href={`/api/handbooks/${handbook.slug}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-bmj-red px-8 py-3 font-label text-sm uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
                >
                  <Download size={16} />
                  Download PDF
                </a>
              </div>
            )}
          </>
        ) : (
          <PaywallGate
            requiredTier={handbook.access_tier}
            previewBody={previewBody}
            isLoggedIn={!!user}
            nextHref={handbookPath(handbook.slug)}
          />
        )}
      </div>

      <StarDivider className="mx-auto max-w-content px-4 sm:px-6 lg:px-8" />

      <div className="mx-auto max-w-content px-4 pb-12 sm:px-6 lg:px-8">
        <Link
          href={PATHS.HANDBOOKS}
          className="font-label text-sm uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-cream"
        >
          ← Back to Handbooks
        </Link>
      </div>
    </div>
  );
}
