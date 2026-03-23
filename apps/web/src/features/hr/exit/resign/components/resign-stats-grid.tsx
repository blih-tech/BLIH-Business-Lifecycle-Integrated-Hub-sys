import type { ExitResignStatItem } from '@/features/hr/exit/resign/types';

import { ResignStatsCard } from './resign-stats-card';

type ResignStatsGridProps = {
  items: ExitResignStatItem[];
};

export function ResignStatsGrid({ items }: ResignStatsGridProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <ResignStatsCard key={item.id} item={item} />
      ))}
    </section>
  );
}
