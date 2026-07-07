'use client';

import { useState } from 'react';
import { Link2 } from 'lucide-react';

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available (e.g. HTTP in dev) — silently ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-2 font-label text-xs uppercase tracking-widest text-bmj-tan transition-colors hover:text-bmj-cream"
      aria-label="Copy link to this page"
    >
      <Link2 size={14} />
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  );
}
