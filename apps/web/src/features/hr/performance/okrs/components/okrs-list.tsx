import type { OkrItem } from '@/features/hr/performance/okrs/types';

import { OkrCard } from './okr-card';

type OkrsListProps = {
  items: OkrItem[];
  expandedIds: string[];
  onToggle: (id: string) => void;
};

export function OkrsList({ items, expandedIds, onToggle }: OkrsListProps) {
  return (
    <section className="space-y-3">
      {items.map((item) => (
        <OkrCard
          key={item.id}
          item={item}
          isExpanded={expandedIds.includes(item.id)}
          onToggle={onToggle}
        />
      ))}
    </section>
  );
}
