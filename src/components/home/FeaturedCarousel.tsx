'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { LensBadge } from '@/components/brand/LensBadge';
import { PageHeader } from '@/components/layout/PageHeader';
import { ButtonLink } from '@/components/ui/Button';
import { PLACEHOLDERS } from '@/lib/placeholders';
import { IMAGE_SIZES } from '@/lib/images';
import { CAROUSEL_INTERVAL_MS } from '@/lib/constants';
import { articlePath } from '@/lib/paths';
import type { ArticleListItem } from '@/lib/supabase/types';

interface FeaturedCarouselProps {
  articles: ArticleListItem[];
}

export function FeaturedCarousel({ articles }: FeaturedCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (articles.length <= 1) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % articles.length);
    }, CAROUSEL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [articles.length]);

  if (articles.length === 0) {
    return (
      <section className="bg-bmj-black py-20">
        <div className="page-shell-tight">
          <PageHeader
            as="h2"
            tone="section"
            align="center"
            title="Featured"
            label="Editor’s Selection"
            dividerPosition="top"
            dividerClassName="mb-10"
          />
          <div className="section-empty-state">
            <p className="section-empty-state-text">Featured articles coming soon.</p>
          </div>
        </div>
      </section>
    );
  }

  const article = articles[index];
  const formattedDate = new Date(article.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <section className="bg-bmj-black py-20">
      <div className="page-shell-tight">
        <PageHeader
          as="h2"
          tone="section"
          align="center"
          title="Featured"
          label="Editor’s Selection"
          description="A rotating front-page feature from the archive, selected for urgency, argument, and staying power."
          dividerPosition="top"
          dividerClassName="mb-10"
        />

        <motion.div
          className="mt-12 card-feature relative min-h-[320px] overflow-hidden sm:min-h-[400px]"
          transition={{ duration: 0.2 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={article.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex min-h-[320px] flex-col sm:min-h-[400px] sm:flex-row"
            >
              {/* Image panel */}
              <div className="relative h-48 w-full overflow-hidden bg-bmj-black sm:h-auto sm:w-1/2">
                <Image
                  src={article.cover_image || PLACEHOLDERS.article}
                  alt={article.title}
                  fill
                  priority
                  className="halftone object-cover transition-transform duration-700 hover:scale-105"
                  sizes={IMAGE_SIZES.cardLarge}
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-grain-texture opacity-[0.06] mix-blend-overlay"
                  aria-hidden="true"
                />
              </div>

              {/* Content panel */}
              <div className="flex flex-1 flex-col justify-center p-8 sm:p-12">
                <LensBadge lens={article.lens} className="mb-4" />

                <h3 className="mb-4 font-display text-3xl uppercase tracking-display leading-tight text-bmj-white sm:text-4xl">
                  {article.title}
                </h3>

                <p className="mb-6 line-clamp-3 font-body text-base leading-relaxed text-bmj-cream/70">
                  {article.excerpt}
                </p>

                <div className="mb-6 flex items-center gap-4">
                  <span className="font-label text-xs uppercase tracking-widest text-bmj-cream/60">
                    {article.author}
                  </span>
                  <span className="font-mono text-xs text-bmj-tan/60">
                    {formattedDate}
                  </span>
                </div>

                <ButtonLink
                  href={articlePath(article.slug)}
                  variant="secondary"
                  className="self-start"
                  aria-label="Read article"
                >
                  Read Article
                </ButtonLink>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress indicators */}
          {articles.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2"
              role="tablist"
              aria-label="Featured article navigation"
            >
              {articles.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Article ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 transition-[width,background-color] duration-300 ${
                    i === index
                      ? 'w-8 bg-bmj-red'
                      : 'w-1.5 bg-bmj-tan/40 hover:bg-bmj-tan'
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
