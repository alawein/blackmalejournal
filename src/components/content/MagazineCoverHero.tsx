import Image from "next/image"
import { BrandMark } from "@/components/brand/BrandMark"
import { IMAGE_SIZES } from "@/lib/images"

interface MagazineCoverHeroProps {
  title: string
  date: string
  issueNumber: number
  coverImageUrl: string
  /** Optional lens label for the kicker */
  lens?: string
}

export default function MagazineCoverHero({
  title,
  date,
  issueNumber,
  coverImageUrl,
  lens,
}: MagazineCoverHeroProps) {
  const formattedIssue = String(issueNumber).padStart(3, "0")

  return (
    <section className="relative w-full overflow-hidden bg-bmj-black">
      {/* Full-bleed cover image */}
      <div className="relative h-[60vh] min-h-[400px] w-full sm:h-[70vh] lg:h-[80vh]">
        <Image
          src={coverImageUrl}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes={IMAGE_SIZES.hero}
        />

        {/* Halftone dot overlay */}
        <div
          className="pointer-events-none absolute inset-0 halftone-dots"
          aria-hidden="true"
        />

        {/* Grain overlay */}
        <div
          className="pointer-events-none absolute inset-0 bg-grain-texture opacity-[0.08] mix-blend-overlay"
          aria-hidden="true"
        />

        {/* Gradient scrim for text readability */}
        <div className="absolute inset-0 gradient-scrim" />

        {/* "FEATURED" diagonal stamp badge */}
        <div className="absolute right-6 top-6 sm:right-8 sm:top-8">
          <div className="relative rotate-[-8deg]">
            <div className="border-2 border-bmj-red bg-bmj-red/90 px-4 py-1.5 font-display text-sm uppercase tracking-label text-bmj-white shadow-elevation-2 sm:text-base">
              Featured
            </div>
          </div>
        </div>

        {/* Content overlay — positioned at bottom */}
        <div className="absolute inset-x-0 bottom-0 px-6 pb-8 sm:px-10 sm:pb-12 lg:px-16 lg:pb-16">
          <div className="mx-auto max-w-content">
            {/* Small brand mark */}
            <BrandMark size={28} color="var(--bmj-red)" className="mb-4" />

            {/* Kicker label */}
            <p className="mb-3 font-label text-stamp uppercase tracking-label-xl text-bmj-red">
              {lens || "Weekend Briefing"}
            </p>

            {/* Headline */}
            <h1 className="hero-title mb-4 max-w-3xl">
              {title}
            </h1>

            {/* Metadata line */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-label-wide text-bmj-tan">
                {date}
              </span>
              <span className="text-bmj-tan/40" aria-hidden="true">&middot;</span>
              <span className="font-mono text-xs uppercase tracking-label-wide text-bmj-tan">
                Issue No. {formattedIssue}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Red rule below hero */}
      <div className="h-[3px] bg-bmj-red" />
    </section>
  )
}
