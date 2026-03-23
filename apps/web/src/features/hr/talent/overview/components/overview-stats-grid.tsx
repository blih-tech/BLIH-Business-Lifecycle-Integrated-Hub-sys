import type { TalentOverviewStat } from '@/features/hr/talent/overview/types';

import { OverviewStatCard } from './overview-stat-card';

type OverviewStatsGridProps = {
  items: TalentOverviewStat[];
};

export function OverviewStatsGrid({ items }: OverviewStatsGridProps) {
  return (
    <section className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <OverviewStatCard key={item.id} item={item} />
      ))}
    </section>
  );
}
