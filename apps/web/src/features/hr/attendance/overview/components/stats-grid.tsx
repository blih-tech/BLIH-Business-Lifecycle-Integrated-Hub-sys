import { StatsCard } from "@/features/hr/attendance/overview/components/stats-card";
import type { AttendanceStatItem } from "@/features/hr/attendance/overview/types";

type StatsGridProps = {
  items: AttendanceStatItem[];
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
