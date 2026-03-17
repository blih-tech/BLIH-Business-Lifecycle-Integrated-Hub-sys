import { StatsCard } from "@/features/hr/attendance/overtime/components/stats-card";
import type { AttendanceOvertimeStat } from "@/features/hr/attendance/overtime/types";

type StatsGridProps = {
  items: AttendanceOvertimeStat[];
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
