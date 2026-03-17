import {
  departmentPerformance,
  distributionData,
  insightCards,
  performanceStats,
  topEmployees,
  trendData,
} from "@/features/hr/performance/overview/mock-data";
import {
  DepartmentPerformanceOverviewCard,
  InsightCardsRow,
  PerformanceDistributionCard,
  PerformanceTrendCard,
  StatsGrid,
  TopPerformingEmployeesCard,
} from "@/features/hr/performance/overview/components";

export * from "@/features/hr/performance/overview/components";
export * from "@/features/hr/performance/overview/types";

export function PerformanceOverviewContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-4 px-4 py-4 md:px-5 md:py-5">
      <StatsGrid items={performanceStats} />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_0.95fr]">
        <TopPerformingEmployeesCard items={topEmployees} />
        <PerformanceDistributionCard data={distributionData} />
      </section>

      <DepartmentPerformanceOverviewCard data={departmentPerformance} />
      <PerformanceTrendCard data={trendData} />
      <InsightCardsRow items={insightCards} />
    </main>
  );
}
