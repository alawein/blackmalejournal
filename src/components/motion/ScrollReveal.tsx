'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore, type ElementType } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Direction of the slide: 'up' (default), 'left', 'right', 'none' (fade only) */
  direction?: 'up' | 'left' | 'right' | 'none';
  /** Delay in seconds before animation starts */
  delay?: number;
  /** Duration in seconds */
  duration?: number;
  /** Render as a different element (default: div) */
  as?: ElementType;
  /** How much of the element must be visible to trigger (0-1) */
  threshold?: number;
}

const hiddenTransform: Record<NonNullable<ScrollRevealProps['direction']>, string> = {
  up: '',
  left: '',
  right: '',
  none: '',
};

function subscribePrefersReducedMotion(onChange: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function getPrefersReducedMotionSnapshot() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Must match the first client `getPrefersReducedMotionSnapshot()` for hydration. */
function getPrefersReducedMotionServerSnapshot() {
  return false;
}

export function ScrollReveal({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  as: Tag = 'div',
  threshold = 0.15,
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  const prefersReducedMotion = useSyncExternalStore(
    subscribePrefersReducedMotion,
    getPrefersReducedMotionSnapshot,
    getPrefersReducedMotionServerSnapshot,
  );

  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver !== 'function') {
      queueMicrotask(() => setRevealed(true));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [prefersReducedMotion, threshold]);

  const transitionStyle = {
    transitionProperty: 'opacity, transform',
    transitionDuration: `${duration}s`,
    transitionDelay: `${delay}s`,
    transitionTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
  } as const;

  const animating = !prefersReducedMotion;
  const hidden = animating && !revealed;
  const tf = hiddenTransform[direction];

  return (
    <Tag
      ref={ref as unknown as React.RefObject<HTMLElement>}
      className={cn(
        className,
        animating && 'will-change-[opacity,transform]',
        hidden
          ? cn('opacity-0', direction !== 'none' && tf)
          : 'opacity-100 translate-x-0 translate-y-0',
      )}
      style={animating ? transitionStyle : undefined}
    >
      {children}
    </Tag>
  );
}
