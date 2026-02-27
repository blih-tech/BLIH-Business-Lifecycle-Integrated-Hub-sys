import {
  pendingActions,
  recentActivities,
  recruitmentStats,
} from "@/features/hr/recruitment/overview/mock-data";
import {
  PendingActions,
  RecentActivities,
  StatsGrid,
} from "@/features/hr/recruitment/overview/components";

export * from "@/features/hr/recruitment/overview/components";
export * from "@/features/hr/recruitment/overview/types";

export function RecruitmentOverviewContent() {
  return (
    <main className="mx-auto w-full max-w-[960px] space-y-4 px-4 py-5 md:px-5 md:py-6">
      <StatsGrid items={recruitmentStats} />
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentActivities items={recentActivities} />
        <PendingActions items={pendingActions} />
      </section>
    </main>
  );
}
