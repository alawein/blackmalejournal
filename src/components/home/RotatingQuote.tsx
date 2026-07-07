"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import QuoteCard from "@/components/content/QuoteCard";
import { QUOTE_ROTATION_INTERVAL_MS } from "@/lib/constants";

interface Quote {
  text: string;
  attribution: string;
}

const QUOTES: Quote[] = [
  {
    text: "A man who does not develop himself becomes a burden to those he loves most.",
    attribution: "The Chairman",
  },
  {
    text: "Discipline is not the enemy of freedom. Discipline is the only path to freedom.",
    attribution: "The Chairman",
  },
  {
    text: "You cannot build a house you have never imagined. Know your mind before you build your legacy.",
    attribution: "The Chairman",
  },
  {
    text: "Resistance is not a position you hold once. It is a practice you return to, every day, in every choice.",
    attribution: "The Chairman",
  },
  {
    text: "The ancestor you honor most is the one who refused to be reduced. Become that ancestor.",
    attribution: "The Chairman",
  },
];

export function RotatingQuote() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % QUOTES.length);
    }, QUOTE_ROTATION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-bmj-black py-24">
      <div className="mx-auto max-w-article px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <QuoteCard
              quote={QUOTES[index].text}
              attribution={QUOTES[index].attribution}
              lens="culture"
            />
          </motion.div>
        </AnimatePresence>

        {/* Progress dot indicators */}
        <div
          className="mt-10 flex justify-center gap-2"
          role="tablist"
          aria-label="Quote navigation"
        >
          {QUOTES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === index}
              aria-label={`Quote ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 transition-[width,background-color,transform] duration-300 ${
                i === index
                  ? "w-6 bg-bmj-red"
                  : "w-1.5 bg-bmj-tan/40 hover:bg-bmj-tan hover:scale-150"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
