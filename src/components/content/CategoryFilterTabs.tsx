'use client';

import type { CourseCategory } from '@/lib/supabase/types';
import { getCategoryLabel } from '@/lib/utils';
import { FilterTabs } from './FilterTabs';

type Tab = { label: string; value: CourseCategory | 'all' };

const TABS: ReadonlyArray<Tab> = [
  { label: 'All', value: 'all' },
  { label: getCategoryLabel('martial-arts'), value: 'martial-arts' },
  { label: getCategoryLabel('mental-health'), value: 'mental-health' },
  { label: getCategoryLabel('relationships'), value: 'relationships' },
  { label: getCategoryLabel('purpose'), value: 'purpose' },
  { label: getCategoryLabel('branding'), value: 'branding' },
];

interface CategoryFilterTabsProps {
  activeCategory: CourseCategory | 'all';
}

export function CategoryFilterTabs({ activeCategory }: CategoryFilterTabsProps) {
  return (
    <FilterTabs
      tabs={TABS}
      activeValue={activeCategory}
      paramKey="category"
      allValue="all"
      ariaLabel="Filter courses by category"
    />
  );
}
