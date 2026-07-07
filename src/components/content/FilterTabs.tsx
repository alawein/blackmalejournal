'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FILTER_TABLIST_ROW_CLASS } from '@/lib/constants';

interface FilterTabsProps<T extends string> {
  tabs: ReadonlyArray<{ label: string; value: T }>;
  activeValue: T;
  paramKey: string;
  allValue: T;
  ariaLabel: string;
  /** Extra URL params to delete on any tab change (e.g. reset 'tag' when lens changes). */
  resetParams?: string[];
  className?: string;
}

export function FilterTabs<T extends string>({
  tabs,
  activeValue,
  paramKey,
  allValue,
  ariaLabel,
  resetParams,
  className,
}: FilterTabsProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSelect(value: T) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === allValue) {
      params.delete(paramKey);
    } else {
      params.set(paramKey, value);
    }
    resetParams?.forEach((p) => params.delete(p));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div
      className={className ?? FILTER_TABLIST_ROW_CLASS}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === activeValue;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(tab.value)}
            className={[
              'filter-tab whitespace-nowrap',
              isActive ? 'border-b-2 border-bmj-red text-bmj-white' : 'filter-tab-inactive',
            ].join(' ')}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
