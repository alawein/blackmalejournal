import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, FileText, Zap, GraduationCap, Play, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getLensTheme } from "@/lib/lens-theme";
import type { Lens } from "@/lib/supabase/types";
import { PATHS, withQuery } from "@/lib/paths";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Records",
  description:
    "The full content records of The Black Male Journal — briefings, articles, dispatches, academy, and video.",
  openGraph: {
    title: "Records",
    description:
      "The full content records of The Black Male Journal — briefings, articles, dispatches, academy, and video.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Records",
    description:
      "The full content records of The Black Male Journal — briefings, articles, dispatches, academy, and video.",
  },
};

type RecordsHub = {
  icon: LucideIcon;
  lens: Lens;
  label: string;
  title: string;
  description: string;
  href: string;
};

const hubs: RecordsHub[] = [
  {
    icon: BookOpen,
    lens: "politics",
    label: "Flagship Publication",
    title: "Weekend Briefings",
    description:
      "Our flagship weekly publication. A curated briefing on the issues, ideas, and culture shaping Black male life.",
    href: PATHS.BRIEFINGS,
  },
  {
    icon: FileText,
    lens: "culture",
    label: "Long-Form Analysis",
    title: "Articles",
    description:
      "Long-form analysis across five lenses of Black male life.",
    href: PATHS.ARTICLES,
  },
  {
    icon: Zap,
    lens: "health",
    label: "Short-Form Commentary",
    title: "Dispatches",
    description:
      "Short-form commentary and rapid analysis. The field notes of revolutionary media.",
    href: PATHS.BLOG,
  },
  {
    icon: GraduationCap,
    lens: "health",
    label: "Structured Learning",
    title: "Academy",
    description:
      "Structured learning: courses in martial arts, mental health, relationships, purpose, and personal branding.",
    href: PATHS.ACADEMY,
  },
  {
    icon: Play,
    lens: "culture",
    label: "Documentary Video",
    title: "Video",
    description: "Documentary-style video content. Watch. Learn. Build.",
    href: PATHS.VIDEO,
  },
];

const lenses = [
  { label: "Health/Wellness",          href: withQuery(PATHS.ARTICLES, { lens: "health" }) },
  { label: "Politics/Law",             href: withQuery(PATHS.ARTICLES, { lens: "politics" }) },
  { label: "Culture/Ideology",         href: withQuery(PATHS.ARTICLES, { lens: "culture" }) },
  { label: "Entertainment/Technology", href: withQuery(PATHS.ARTICLES, { lens: "entertainment" }) },
  { label: "Business/Finance",         href: withQuery(PATHS.ARTICLES, { lens: "business" }) },
];

export default function RecordsPage() {
  return (
    <div className="page-shell-tight py-16">
      <PageHeader
        label="Content Records"
        title="Records"
        description="Everything published under The Black Male Journal banner — briefings, long reads, dispatches, courses, and video."
        dividerClassName="mb-12"
      />

      <section className="py-4">
        <p className="editorial-kicker mb-8">
          Content Sections
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hubs.map(({ icon: Icon, lens, label, title, description, href }) => {
            const theme = getLensTheme(lens);

            return (
              <Link
                key={href}
                href={href}
                className={cn("card-media group block p-8", theme.cardBorderTop, theme.hoverBorder)}
              >
                <p className={cn("mb-3 font-label text-xs uppercase tracking-widest", theme.accentText)}>
                  {label}
                </p>
                <div className="mb-4 flex items-center gap-4">
                  <span
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-full",
                      theme.accentSoftBg,
                      theme.accentText,
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                  </span>
                  <h2 className="font-display text-2xl uppercase text-bmj-white">
                    {title}
                  </h2>
                </div>
                <p className="font-body text-sm leading-relaxed text-bmj-cream/70">
                  {description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="py-16">
        <p className="editorial-kicker mb-6">
          Browse by Lens
        </p>
        <div className="flex flex-wrap gap-4">
          {lenses.map(({ label, href }) => (
            <ButtonLink
              key={href}
              href={href}
              variant="ghost"
            >
              {label}
            </ButtonLink>
          ))}
        </div>
      </section>

      <section className="py-16">
        <p className="editorial-kicker mb-4">
          Independent Media
        </p>
        <h2 className="mb-4 font-display text-4xl uppercase text-bmj-white md:text-5xl">
          Keep This Going
        </h2>
        <p className="mb-8 max-w-lg font-body text-sm leading-relaxed text-bmj-cream/70">
          No sponsors. No advertisers. The Black Male Journal runs on direct
          reader support. If this work matters to you, fund it.
        </p>
        <ButtonLink href={PATHS.SUPPORT} variant="primary" size="lg">
          Support the Mission
        </ButtonLink>
      </section>
    </div>
  );
}
