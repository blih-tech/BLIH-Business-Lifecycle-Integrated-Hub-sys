import type { PerformanceStatItem } from '@/features/hr/performance/overview/types';

import { StatsCard } from './stats-card';

type StatsGridProps = {
  items: PerformanceStatItem[];
};

export function StatsGrid({ items }: StatsGridProps) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <StatsCard key={item.id} {...item} />
      ))}
    </section>
  );
}
