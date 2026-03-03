import {
  dailyAreaData,
  monthlyFrequencyData,
  recruitmentStats,
} from "@/features/hr/recruitment/overview/mock-data";
import {
  JobApplicationFrequencyPanel,
  StatsGrid,
} from "@/features/hr/recruitment/overview/components";

export * from "@/features/hr/recruitment/overview/components";
export * from "@/features/hr/recruitment/overview/types";

export function RecruitmentOverviewContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-6 px-4 py-4 md:px-5 md:py-5">
      <StatsGrid items={recruitmentStats} />
      <JobApplicationFrequencyPanel
        monthlyData={monthlyFrequencyData}
        dailyData={dailyAreaData}
      />
    </main>
  );
}
