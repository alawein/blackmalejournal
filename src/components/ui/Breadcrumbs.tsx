import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { PATHS } from '@/lib/paths';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-1 font-mono text-xs text-bmj-tan">
        <li className="flex items-center gap-1">
          <Link
            href={PATHS.HOME}
            className="flex items-center gap-1 text-bmj-tan no-underline transition-colors hover:text-bmj-cream"
            aria-label="Home"
          >
            <Home size={12} aria-hidden="true" />
          </Link>
        </li>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              <ChevronRight size={12} className="text-bmj-tan/40" aria-hidden="true" />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-bmj-tan no-underline transition-colors hover:text-bmj-cream"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? 'text-bmj-cream' : 'text-bmj-tan'}
                  {...(isLast ? { 'aria-current': 'page' as const } : {})}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
