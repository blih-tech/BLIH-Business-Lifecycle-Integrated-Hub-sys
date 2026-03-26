import type { DisciplineRateSnapshot, HotDisciplineIssue } from "@/features/hr/talent/overview/types";

import { DisciplineRateCard } from "./discipline-rate-card";
import { HotDisciplineIssueCard } from "./hot-discipline-issue-card";

type DisciplineInsightsProps = {
  hotIssue: HotDisciplineIssue;
  rateSnapshot: DisciplineRateSnapshot;
};

export function DisciplineInsights({ hotIssue, rateSnapshot }: DisciplineInsightsProps) {
  return (
    <section className="grid gap-2.5 lg:grid-cols-2">
      <HotDisciplineIssueCard item={hotIssue} />
      <DisciplineRateCard item={rateSnapshot} />
    </section>
  );
}
