'use client';

import { usePathname } from 'next/navigation';
import { useSyncExternalStore, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface PageTransitionProps {
  children: ReactNode;
}

// ─── Reduced Motion ───────────────────────────────────────────────────────────

function subscribeReducedMotion(cb: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

function getReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ─── Transition Variants ──────────────────────────────────────────────────────

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const fadeTransition = { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const };

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Smooth page transition using Framer Motion AnimatePresence.
 * Fades between route changes with a subtle cross-dissolve.
 * Respects prefers-reduced-motion.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  const prefersReduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );

  if (prefersReduced) {
    return (
      <div key={pathname} className="animate-fade-in motion-reduce:animate-none">
        {children}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={fadeVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={fadeTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
