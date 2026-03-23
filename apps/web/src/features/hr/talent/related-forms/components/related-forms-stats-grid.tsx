import type { RelatedFormsStat } from '@/features/hr/talent/related-forms/types';

import { RelatedFormsStatCard } from './related-forms-stat-card';

type RelatedFormsStatsGridProps = {
  items: RelatedFormsStat[];
};

export function RelatedFormsStatsGrid({ items }: RelatedFormsStatsGridProps) {
  return (
    <section className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <RelatedFormsStatCard key={item.id} item={item} />
      ))}
    </section>
  );
}
