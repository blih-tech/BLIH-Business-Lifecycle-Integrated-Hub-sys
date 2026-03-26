import type { ResignationTrendPoint } from "@/features/hr/exit/overview/types";

import { OffboardingSummaryCard } from "./offboarding-summary-card";
import { ResignationTrendsCard } from "./resignation-trends-card";

type ResignationTrendsSectionProps = {
  data: ResignationTrendPoint[];
};

export function ResignationTrendsSection({ data }: ResignationTrendsSectionProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      <ResignationTrendsCard data={data} />
      <OffboardingSummaryCard />
    </section>
  );
}
