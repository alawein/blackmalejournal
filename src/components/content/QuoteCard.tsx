import Image from "next/image";
import { getLensTheme } from "@/lib/lens-theme";
import { cn } from "@/lib/utils";
import type { Lens } from "@/lib/supabase/types";

interface QuoteCardProps {
  quote: string
  attribution: string
  portraitUrl?: string
  lens?: Lens
}

export default function QuoteCard({
  quote,
  attribution,
  portraitUrl,
  lens = "health",
}: QuoteCardProps) {
  const theme = getLensTheme(lens);
  const textColor = "text-bmj-cream";

  return (
    <div className={cn(theme.accentSoftBg, "paper-texture border border-bmj-tan/25 p-6 sm:p-8")}>
      <div
        className={`flex flex-col ${portraitUrl ? "sm:flex-row sm:items-center sm:gap-6" : ""}`}
      >
        {portraitUrl && (
          <div className="halftone-dots relative mb-4 h-24 w-24 flex-shrink-0 overflow-hidden sm:mb-0 sm:h-28 sm:w-28">
            <Image
              src={portraitUrl}
              alt={attribution}
              fill
              sizes="112px"
              className="halftone-heavy object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <span className={`font-display text-6xl leading-none ${textColor}`}>
            &ldquo;
          </span>
          <blockquote
            className={`-mt-8 font-body text-base font-bold uppercase leading-snug sm:text-lg ${textColor}`}
          >
            {quote}
          </blockquote>
          <div className={cn("mt-4 h-0.5 w-10", theme.accentBg)} />
          <p
            className={`mt-2 font-label text-xs uppercase tracking-widest ${textColor} opacity-70`}
          >
            {attribution}
          </p>
        </div>
      </div>
    </div>
  );
}
