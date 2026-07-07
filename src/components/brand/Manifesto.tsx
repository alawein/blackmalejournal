import { cn } from "@/lib/utils";
import { Kicker } from "./Kicker";
import { StarDivider } from "@/components/ui/StarDivider";

interface ManifestoProps {
  title: string;
  incitement?: string;
  children: React.ReactNode;
  className?: string;
}

export function Manifesto({
  title,
  incitement,
  children,
  className,
}: ManifestoProps) {
  return (
    <div className={cn("bg-bmj-black text-bmj-cream min-h-screen", className)}>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {incitement && (
          <Kicker className="mb-8 animate-fade-in text-bmj-red">
            {incitement}
          </Kicker>
        )}
        <h1 className="hero-title mb-6 animate-fade-in-up">
          {title}
        </h1>
        <StarDivider className="w-full max-w-md animate-fade-in" />
      </section>

      {/* Content Section */}
      <section className="page-shell max-w-article pb-24 animate-fade-in">
        <div className="accent-border-top pt-12">
          {children}
        </div>
      </section>

      {/* Final Call to Action / Command */}
      <section className="bg-bmj-deep-black py-24 text-center">
        <div className="page-shell">
          <StarDivider className="mb-12" />
          <Kicker className="justify-center text-bmj-amber mb-6">Final Command</Kicker>
          <blockquote className="quote-text max-w-3xl mx-auto mb-12 italic">
            "Speak the truth. Navigate the consequences. The world is built by those who refuse to be silent."
          </blockquote>
          <div className="flex justify-center gap-6">
            <div className="w-12 h-px bg-bmj-red" />
            <div className="w-12 h-px bg-bmj-red" />
            <div className="w-12 h-px bg-bmj-red" />
          </div>
        </div>
      </section>
    </div>
  );
}
