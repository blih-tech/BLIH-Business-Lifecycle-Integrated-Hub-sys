import type { DisciplineStat } from '@/features/hr/talent/discipline/types';
import { Card, CardContent } from '@/shared/components/ui/card';

import { DisciplineStatCard } from './discipline-stat-card';

type DisciplineStatisticsProps = {
  items: DisciplineStat[];
};

export function DisciplineStatistics({ items }: DisciplineStatisticsProps) {
  return (
    <Card className="gap-0 rounded-[10px] border-border py-0 shadow-none">
      <CardContent className="space-y-3 p-3">
        <p className="text-sm font-medium tracking-[-0.176px] text-black">
          Discipline Statistics
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <DisciplineStatCard key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
