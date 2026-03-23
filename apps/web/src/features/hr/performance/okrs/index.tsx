'use client';

import { useMemo, useState } from 'react';

import {
  okrItems,
  okrSummaryStats,
} from '@/features/hr/performance/okrs/mock-data';
import type { OkrItem } from '@/features/hr/performance/okrs/types';

import { OkrsFilters, OkrsList, SummaryStatsGrid } from './components';

export * from '@/features/hr/performance/okrs/components';
export * from '@/features/hr/performance/okrs/types';

function sortItems(items: OkrItem[], sortBy: 'name-asc' | 'name-desc') {
  return [...items].sort((a, b) =>
    sortBy === 'name-desc'
      ? b.title.localeCompare(a.title)
      : a.title.localeCompare(b.title),
  );
}

export function PerformanceOkrsContent() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc'>('name-asc');
  const defaultExpandedId = okrItems.find((item) => item.expanded)?.id;
  const [expandedIds, setExpandedIds] = useState<string[]>(
    defaultExpandedId ? [defaultExpandedId] : [],
  );

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    const rows = okrItems.filter((item) => {
      const bySearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.owner.toLowerCase().includes(query);
      const byDepartment =
        department === 'all' || item.department === department;
      return bySearch && byDepartment;
    });

    return sortItems(rows, sortBy);
  }, [search, department, sortBy]);

  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-4 px-4 py-4 md:px-5 md:py-5">
      <OkrsFilters
        search={search}
        onSearchChange={setSearch}
        department={department}
        onDepartmentChange={setDepartment}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      <SummaryStatsGrid items={okrSummaryStats} />
      <OkrsList
        items={filteredItems}
        expandedIds={expandedIds}
        onToggle={(id) => {
          setExpandedIds((previous) =>
            previous.includes(id)
              ? previous.filter((itemId) => itemId !== id)
              : [...previous, id],
          );
        }}
      />
    </main>
  );
}
