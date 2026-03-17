import type { ExitOverviewStat } from "@/features/hr/exit/overview/types";

import { ExitOverviewStatCard } from "./exit-overview-stat-card";

type ExitOverviewStatsGridProps = {
  items: ExitOverviewStat[];
};

export function ExitOverviewStatsGrid({ items }: ExitOverviewStatsGridProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <ExitOverviewStatCard key={item.id} item={item} />
      ))}
    </section>
  );
}
