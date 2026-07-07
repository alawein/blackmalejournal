/**
 * Animation utilities and presets for consistent motion across the site.
 * Uses Framer Motion patterns optimized for BMJ's editorial aesthetic.
 *
 * @see src/components/motion/ScrollReveal.tsx
 * @see src/components/motion/PageTransition.tsx
 */

import type { Transition, Variants } from 'framer-motion';

// ─── Easing Functions ─────────────────────────────────────────────────────────
// Custom easing curves for BMJ's editorial feel
export const easings = {
  /** Smooth deceleration — default for most animations */
  smooth: [0.25, 0.1, 0.25, 1.0] as const,
  /** Quick entrance with gentle settle */
  entrance: [0.0, 0.0, 0.2, 1.0] as const,
  /** Gentle exit with acceleration */
  exit: [0.4, 0.0, 1.0, 1.0] as const,
  /** Snappy interaction feedback */
  snappy: [0.4, 0.0, 0.2, 1.0] as const,
  /** Elastic overshoot — use sparingly */
  elastic: [0.68, -0.55, 0.265, 1.55] as const,
} as const;

// ─── Duration Presets ─────────────────────────────────────────────────────────
export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.7,
  slowest: 1.0,
} as const;

// ─── Transition Presets ───────────────────────────────────────────────────────
export const transitions = {
  /** Default transition for most elements */
  default: {
    duration: durations.normal,
    ease: easings.smooth,
  } as Transition,

  /** Fast micro-interaction feedback */
  micro: {
    duration: durations.fast,
    ease: easings.snappy,
  } as Transition,

  /** Slow, dramatic reveals */
  dramatic: {
    duration: durations.slow,
    ease: easings.entrance,
  } as Transition,

  /** Staggered children animation */
  stagger: {
    staggerChildren: 0.08,
    delayChildren: 0.1,
  } as Transition,

  /** Spring physics for interactive elements */
  spring: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  } as Transition,

  /** Gentle spring for larger movements */
  springGentle: {
    type: 'spring',
    stiffness: 200,
    damping: 25,
  } as Transition,
} as const;

// ─── Animation Variants ───────────────────────────────────────────────────────

/** Fade in/out */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    transition: { ...transitions.default, ease: easings.exit },
  },
};

/** Slide up and fade */
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { ...transitions.default, ease: easings.exit },
  },
};

/** Slide down and fade */
export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.default,
  },
};

/** Slide from left */
export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.default,
  },
};

/** Slide from right */
export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.default,
  },
};

/** Scale up with fade — good for modals/overlays */
export const scaleUpVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: transitions.micro,
  },
};

/** Container with staggered children */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      ...transitions.stagger,
      when: 'beforeChildren',
    },
  },
};

/** Individual stagger child */
export const staggerChildVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.default,
  },
};

// ─── Hover/Tap States ─────────────────────────────────────────────────────────

/** Card hover lift effect */
export const cardHoverVariants: Variants = {
  initial: { y: 0 },
  hover: {
    y: -4,
    transition: transitions.micro,
  },
  tap: {
    y: -2,
    transition: transitions.micro,
  },
};

/** Button press effect */
export const buttonTapVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: transitions.micro,
  },
  tap: {
    scale: 0.98,
    transition: { duration: durations.instant },
  },
};

/** Icon rotation on hover */
export const iconRotateVariants: Variants = {
  initial: { rotate: 0 },
  hover: {
    rotate: 15,
    transition: transitions.spring,
  },
};

// ─── Page Transition Variants ─────────────────────────────────────────────────

/** Horizontal slide — for sibling route transitions (articles ↔ briefings) */
export const slideHorizontalVariants: Variants = {
  initial: { opacity: 0, x: 60 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.slow, ease: easings.smooth },
  },
  exit: {
    opacity: 0,
    x: -60,
    transition: { duration: durations.normal, ease: easings.exit },
  },
};

/** Vertical reveal — for drill-down transitions (listing → detail) */
export const slideVerticalVariants: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.slow, ease: easings.entrance },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: durations.fast, ease: easings.exit },
  },
};

/** Brand flash — red overlay on initial load */
export const brandFlashVariants: Variants = {
  initial: { opacity: 1 },
  animate: {
    opacity: 0,
    transition: { duration: durations.slow, delay: 0.3, ease: easings.exit },
  },
};

/** Breathing letter-spacing effect */
export const breatheVariants: Variants = {
  initial: { letterSpacing: '0.06em' },
  hover: {
    letterSpacing: '0.12em',
    transition: { duration: durations.slower, ease: easings.smooth },
  },
};

// ─── Utility Functions ────────────────────────────────────────────────────────

/**
 * Create stagger delay for list items
 */
export function staggerDelay(index: number, baseDelay = 0.05): number {
  return index * baseDelay;
}

/**
 * Get reduced motion safe animation props
 */
export function getMotionProps(prefersReducedMotion: boolean | null) {
  if (prefersReducedMotion) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      transition: { duration: 0 },
    };
  }
  return {};
}

/**
 * Viewport animation trigger settings
 */
export const viewportSettings = {
  /** Trigger once when element enters viewport */
  once: { once: true, amount: 0.2 as const },
  /** Trigger every time element enters/exits */
  always: { once: false, amount: 0.2 as const },
  /** Trigger when mostly visible */
  full: { once: true, amount: 0.8 as const },
} as const;
