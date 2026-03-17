import type { WorkforceOverviewStat } from "@/features/hr/workforce/overview/types";

import { WorkforceOverviewStatCard } from "./workforce-overview-stat-card";

type WorkforceOverviewStatsGridProps = {
  items: WorkforceOverviewStat[];
};

export function WorkforceOverviewStatsGrid({ items }: WorkforceOverviewStatsGridProps) {
  return (
    <section className="grid gap-3 md:grid-cols-4">
      {items.map((item) => (
        <WorkforceOverviewStatCard key={item.id} item={item} />
      ))}
    </section>
  );
}
