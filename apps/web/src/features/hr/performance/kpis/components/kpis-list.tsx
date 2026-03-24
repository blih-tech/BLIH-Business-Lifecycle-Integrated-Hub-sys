import type { KpiItem } from '@/features/hr/performance/kpis/types';

import { KpiCard } from './kpi-card';

type KpisListProps = {
  items: KpiItem[];
};

export function KpisList({ items }: KpisListProps) {
  return (
    <section className="space-y-3">
      {items.map((item) => (
        <KpiCard key={item.id} item={item} />
      ))}
    </section>
  );
}
