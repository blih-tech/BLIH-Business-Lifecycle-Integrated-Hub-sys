import { StatsCard } from "@/features/hr/overview/components/stats-card";
import type { RecruitmentStatItem } from "@/features/hr/overview/types";

type StatsGridProps = {
  items: RecruitmentStatItem[];
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
