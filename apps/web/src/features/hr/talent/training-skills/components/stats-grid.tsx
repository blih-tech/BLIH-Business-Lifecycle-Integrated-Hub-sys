import type { TrainingSkillsStat } from '@/features/hr/talent/training-skills/types';

import { StatsCard } from './stats-card';

type StatsGridProps = {
  items: TrainingSkillsStat[];
};

export function StatsGrid({ items }: StatsGridProps) {
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <StatsCard key={item.id} item={item} />
      ))}
    </section>
  );
}
