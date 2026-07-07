'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { SCROLL_THRESHOLD_BACK_TO_TOP } from '@/lib/constants';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > SCROLL_THRESHOLD_BACK_TO_TOP);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-8 right-8 z-50 flex h-11 w-11 items-center justify-center border border-bmj-tan/30 bg-bmj-brown text-bmj-cream transition-[border-color,color] hover:border-bmj-red hover:text-bmj-white"
    >
      <ArrowUp size={18} aria-hidden="true" />
    </button>
  );
}
