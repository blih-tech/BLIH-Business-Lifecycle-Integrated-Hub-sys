import { StatsCard } from "@/features/hr/attendance/requests/components/stats-card";
import type { AttendanceRequestStat } from "@/features/hr/attendance/requests/types";

type StatsGridProps = {
  items: AttendanceRequestStat[];
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
