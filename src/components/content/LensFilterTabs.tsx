'use client';

import type { Lens } from '@/lib/supabase/types';
import { FilterTabs } from './FilterTabs';

type Tab = { label: string; value: Lens | 'all' };

const TABS: ReadonlyArray<Tab> = [
  { label: 'All',                        value: 'all' },
  { label: 'Health/Wellness',            value: 'health' },
  { label: 'Politics/Law',               value: 'politics' },
  { label: 'Culture/Ideology',           value: 'culture' },
  { label: 'Entertainment/Technology',   value: 'entertainment' },
  { label: 'Business/Finance',           value: 'business' },
];

interface LensFilterTabsProps {
  activeLens: Lens | 'all';
}

export function LensFilterTabs({ activeLens }: LensFilterTabsProps) {
  return (
    <FilterTabs
      tabs={TABS}
      activeValue={activeLens}
      paramKey="lens"
      allValue="all"
      ariaLabel="Filter articles by lens"
      resetParams={['tag']}
    />
  );
}
