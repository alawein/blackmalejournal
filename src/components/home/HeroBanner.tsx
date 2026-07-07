// src/components/home/HeroBanner.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";
import { ButtonLink } from "@/components/ui/Button";
import { PATHS } from "@/lib/paths";

export function HeroBanner() {
  const prefersReduced = useReducedMotion();

  const instant = { duration: 0 } as const;
  const fadeIn = prefersReduced
    ? { initial: { opacity: 1 }, transition: instant }
    : { initial: { opacity: 0 }, transition: { duration: 0.5, ease: "easeOut" as const } };
  const slideUp30 = prefersReduced
    ? { initial: { opacity: 1 }, transition: instant }
    : { initial: { opacity: 0 }, transition: { duration: 0.5, ease: "easeOut" as const } };
  const slideUp20 = prefersReduced
    ? { initial: { opacity: 1 }, transition: instant }
    : { initial: { opacity: 0 }, transition: { duration: 0.5, delay: 0.1, ease: "easeOut" as const } };
  const slideUp20delayed = prefersReduced
    ? { initial: { opacity: 1 }, transition: instant }
    : { initial: { opacity: 0 }, transition: { duration: 0.5, delay: 0.2, ease: "easeOut" as const } };

  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-bmj-black">
      {/* Large brand mark watermark — low opacity background texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ opacity: 0.025 }}
      >
        <BrandMark size={700} color="var(--bmj-cream)" />
      </div>

      <div className="relative z-10 mx-auto max-w-content px-6 py-24 text-center">
        {/* Publication identifier — declaration, not just a brand name */}
        <motion.p
          initial={fadeIn.initial}
          animate={{ opacity: 1 }}
          transition={fadeIn.transition}
          className="mb-6 font-mono text-xs uppercase tracking-label-max text-bmj-tan"
        >
          Vol. I &nbsp;&middot;&nbsp; Est. MMXXV &nbsp;&middot;&nbsp; Independent
        </motion.p>

        {/* Main headline */}
        <motion.h1
          initial={slideUp30.initial}
          animate={{ opacity: 1, y: 0 }}
          transition={slideUp30.transition}
          className="font-display text-6xl leading-none tracking-display text-bmj-white sm:text-7xl md:text-9xl"
        >
          THE BLACK MALE JOURNAL
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={slideUp20.initial}
          animate={{ opacity: 1, y: 0 }}
          transition={slideUp20.transition}
          className="mt-6 font-body text-base italic text-bmj-cream/70 md:text-xl"
        >
          Independent Media House · Revolutionary Masculinist Platform
        </motion.p>

        {/* Rule + mission + three-lens footer + CTA */}
        <motion.div
          initial={slideUp20delayed.initial}
          animate={{ opacity: 1, y: 0 }}
          transition={slideUp20delayed.transition}
        >
          <div className="mx-auto my-8 h-[3px] w-32 bg-bmj-red" />

          <p className="mx-auto max-w-2xl font-body text-base leading-relaxed text-bmj-cream/70 md:text-lg">
            We chronicle the full complexity of Black male life — mind, body, and power. No
            apology. No dilution. This is the record of men who choose to be deliberate.
          </p>

          <p className="mt-4 font-label text-xs uppercase tracking-label-max text-bmj-tan/60">
            Health &nbsp;&middot;&nbsp; Philosophy &nbsp;&middot;&nbsp; Politics
          </p>

          <div className="mt-12">
            <ButtonLink href={PATHS.BRIEFINGS} variant="primary" size="lg">
              Read the Latest Briefing
            </ButtonLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
