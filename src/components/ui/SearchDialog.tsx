'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { LensBadge } from '@/components/brand/LensBadge';
import { SEARCH_TYPE_ICONS, SEARCH_TYPE_PATHS } from '@/lib/content/search-constants';
import type { SearchResult, Lens } from '@/lib/supabase/types';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Focus input, lock body scroll on open
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
      setQuery('');
      setResults([]);
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  // Escape to close + focus trap
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }

    // Focus trap within dialog
    if (e.key === 'Tab' && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results);
        }
      } catch {
        // Silently fail — user can retry
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(result: SearchResult) {
    const basePath = SEARCH_TYPE_PATHS[result.type] ?? '/articles';
    router.push(`${basePath}/${result.slug}`);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]">
      <div
        data-testid="search-backdrop"
        className="absolute inset-0 bg-bmj-black/90"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search the journal"
        className="relative z-10 w-full max-w-xl border border-bmj-tan/20 bg-bmj-deep-black"
      >
        <div className="flex items-center gap-3 border-b border-bmj-tan/20 px-6 py-4">
          <Search size={18} className="text-bmj-tan" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            role="searchbox"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, briefings, handbooks…"
            className="flex-1 bg-transparent font-body text-sm text-bmj-cream placeholder:text-bmj-tan/70 outline-none"
            aria-label="Search"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="text-bmj-tan transition-opacity hover:opacity-70"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto overscroll-contain" aria-live="polite">
          {loading && (
            <p className="flex items-center gap-2 px-6 py-4 font-mono text-xs text-bmj-tan" role="status">
              <span className="inline-block h-3 w-3 animate-spin border border-bmj-tan/60 border-t-bmj-red" />
              Searching…
            </p>
          )}
          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <p className="px-6 py-8 text-center font-body text-sm text-bmj-tan" role="status">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}
          {results.map((result) => {
            const Icon = SEARCH_TYPE_ICONS[result.type] ?? SEARCH_TYPE_ICONS.article;
            return (
              <button
                key={`${result.type}-${result.slug}`}
                onClick={() => handleSelect(result)}
                className="flex w-full items-start gap-4 border-b border-bmj-tan/10 px-6 py-4 text-left transition-colors hover:bg-bmj-brown/40"
              >
                <Icon size={16} className="mt-0.5 shrink-0 text-bmj-tan" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-micro uppercase tracking-widest text-bmj-tan">{result.type}</span>
                    {result.lens && <LensBadge lens={result.lens as Lens} />}
                  </div>
                  <p className="mt-1 font-display text-sm text-bmj-white">{result.title}</p>
                  {result.excerpt && (
                    <p className="mt-1 line-clamp-1 font-body text-xs text-bmj-cream/70">{result.excerpt}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <div className="border-t border-bmj-tan/20 px-6 py-3">
          <p className="font-mono text-micro text-bmj-tan">
            <kbd className="border border-bmj-tan/30 px-1 py-0.5 text-bmj-cream">ESC</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
