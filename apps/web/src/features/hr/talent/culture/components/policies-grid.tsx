import type { CulturePolicy } from '@/features/hr/talent/culture/types';

import { PolicyCard } from './policy-card';

type PoliciesGridProps = {
  items: CulturePolicy[];
};

export function PoliciesGrid({ items }: PoliciesGridProps) {
  return (
    <section className="grid grid-cols-1 gap-3 xl:grid-cols-2">
      {items.map((item) => (
        <PolicyCard key={item.id} item={item} />
      ))}
    </section>
  );
}
