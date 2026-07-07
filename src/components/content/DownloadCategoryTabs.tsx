'use client';

import { FilterTabs } from './FilterTabs';

type DownloadCat = 'template' | 'worksheet' | 'guide' | 'toolkit' | 'handbook' | 'all';

type Tab = { label: string; value: DownloadCat };

const TABS: ReadonlyArray<Tab> = [
  { label: 'All',        value: 'all' },
  { label: 'Templates',  value: 'template' },
  { label: 'Worksheets', value: 'worksheet' },
  { label: 'Guides',     value: 'guide' },
  { label: 'Toolkits',   value: 'toolkit' },
  { label: 'Handbooks',  value: 'handbook' },
];

interface DownloadCategoryTabsProps {
  activeCategory: string;
}

export function DownloadCategoryTabs({ activeCategory }: DownloadCategoryTabsProps) {
  return (
    <FilterTabs
      tabs={TABS}
      activeValue={(activeCategory as DownloadCat) || 'all'}
      paramKey="category"
      allValue="all"
      ariaLabel="Filter downloads by category"
    />
  );
}
