import Link from "next/link";
import Image from "next/image";
import { LensBadge } from "@/components/brand/LensBadge";
import { getLensTheme } from "@/lib/lens-theme";
import { PLACEHOLDERS } from "@/lib/placeholders";
import { IMAGE_SIZES } from "@/lib/images";
import { articlePath } from "@/lib/paths";
import { cn } from "@/lib/utils";
import type { Lens } from "@/lib/supabase/types";

interface Article {
  slug: string;
  title: string;
  excerpt: string | null;
  lens: Lens;
  cover_image: string | null;
  published_at: string | null;
}

interface NewspaperGridProps {
  articles: Article[];
}

export default function NewspaperGrid({ articles }: NewspaperGridProps) {
  if (articles.length === 0) return null;
  const [lead, ...secondary] = articles.slice(0, 3);
  const leadTheme = getLensTheme(lead.lens);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr] lg:grid-rows-2">
      {/* Lead story — spans 2 rows on desktop */}
      <Link
        href={articlePath(lead.slug)}
        className={cn(
          "group relative flex min-h-[280px] items-end overflow-hidden card-media lg:row-span-2 lg:min-h-0",
          leadTheme.cardBorderTop,
          leadTheme.hoverBorder,
        )}
      >
        <Image
          src={lead.cover_image || PLACEHOLDERS.article}
          alt=""
          fill
          priority
          sizes={IMAGE_SIZES.cardLarge}
          className="halftone object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div
          className="relative z-10 w-full p-5"
          style={{ backgroundColor: "var(--bmj-feature-overlay)" }}
        >
          <LensBadge lens={lead.lens} />
          <h3 className="mt-3 font-display text-2xl uppercase tracking-display text-bmj-white sm:text-3xl">
            {lead.title}
          </h3>
          {lead.excerpt && (
            <p className="mt-3 line-clamp-2 font-body text-sm leading-relaxed text-bmj-cream/80">
              {lead.excerpt}
            </p>
          )}
        </div>
      </Link>

      {/* Secondary stories */}
      {secondary.map((article) => {
        const theme = getLensTheme(article.lens);

        return (
          <Link
            key={article.slug}
            href={articlePath(article.slug)}
            className={cn(
              "group card-media p-4",
              theme.cardBorderTop,
              theme.hoverBorder,
            )}
          >
            <LensBadge lens={article.lens} />
            <h3 className="mt-3 font-display text-lg uppercase tracking-display text-bmj-white sm:text-xl">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="mt-2 line-clamp-2 font-body text-sm leading-relaxed text-bmj-cream/70">
                {article.excerpt}
              </p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
