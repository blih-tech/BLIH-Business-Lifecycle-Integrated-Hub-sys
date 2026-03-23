'use client';

import { useMemo, useState } from 'react';

import {
  kpiItems,
  kpiSummaryStats,
} from '@/features/hr/performance/kpis/mock-data';
import type { KpiItem } from '@/features/hr/performance/kpis/types';

import { KpisFilters, KpisList, SummaryStatsGrid } from './components';

export * from '@/features/hr/performance/kpis/components';
export * from '@/features/hr/performance/kpis/types';

function sortItems(items: KpiItem[], sortBy: 'name-asc' | 'name-desc') {
  return [...items].sort((a, b) =>
    sortBy === 'name-desc'
      ? b.title.localeCompare(a.title)
      : a.title.localeCompare(b.title),
  );
}

export function PerformanceKpisContent() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc'>('name-asc');

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    const rows = kpiItems.filter((item) => {
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
      <KpisFilters
        search={search}
        onSearchChange={setSearch}
        department={department}
        onDepartmentChange={setDepartment}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      <SummaryStatsGrid items={kpiSummaryStats} />
      <KpisList items={filteredItems} />
    </main>
  );
}
