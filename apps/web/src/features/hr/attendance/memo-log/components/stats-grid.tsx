import { StatsCard } from '@/features/hr/attendance/memo-log/components/stats-card';
import type { AttendanceMemoStat } from '@/features/hr/attendance/memo-log/types';

type StatsGridProps = {
  items: AttendanceMemoStat[];
};

export function StatsGrid({ items }: StatsGridProps) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <StatsCard key={item.id} {...item} />
      ))}
    </section>
  );
}
