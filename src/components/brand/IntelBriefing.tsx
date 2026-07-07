import { cn } from "@/lib/utils";
import { Kicker } from "./Kicker";

interface IntelBriefingProps {
  title: string;
  classification?: string;
  date?: string;
  children: React.ReactNode;
  className?: string;
}

export function IntelBriefing({
  title,
  classification = "STRICTLY CONFIDENTIAL",
  date,
  children,
  className,
}: IntelBriefingProps) {
  return (
    <div
      className={cn(
        "surface-panel-paper paper-texture relative p-8 md:p-12 lg:p-16",
        "mx-auto max-w-article shadow-elevation-3",
        className
      )}
    >
      {/* Classification Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b-2 border-bmj-deep-black/20 pb-6 mb-8">
        <div className="flex flex-col gap-1">
          <span className="font-typewriter text-micro uppercase tracking-widest text-bmj-crimson font-bold">
            {classification}
          </span>
          {date && (
            <span className="font-typewriter text-stamp text-bmj-deep-black/60">
              {date}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Kicker className="text-bmj-deep-black/40 font-typewriter">Intel Briefing // BMJ-A-001</Kicker>
        </div>
      </div>

      {/* Title Section */}
      <header className="mb-10">
        <h1 className="text-bmj-deep-black font-display text-4xl md:text-5xl lg:text-6xl uppercase tracking-section leading-none mb-4">
          {title}
        </h1>
        <div className="w-24 h-1 bg-bmj-crimson" />
      </header>

      {/* Content */}
      <div className="body-text text-bmj-deep-black font-body leading-article">
        {children}
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-bmj-deep-black/10 flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <span className="font-typewriter text-micro text-bmj-deep-black/40">
            OFFICIAL CORRESPONDENCE
          </span>
          <span className="font-typewriter text-micro text-bmj-deep-black/40">
            THE CHAIRMAN // THE BLACK MALE JOURNAL
          </span>
        </div>
        <div className="text-bmj-deep-black/20 font-typewriter text-stamp">
          COPYRIGHT 2026 // ALL RIGHTS RESERVED
        </div>
      </footer>
    </div>
  );
}
