import {
  disciplineRateSnapshot,
  hotDisciplineIssue,
  overviewStats,
  pendingApprovalRequests,
} from '@/features/hr/talent/overview/mock-data';
import {
  DisciplineInsights,
  OverviewStatsGrid,
  PendingApprovalRequests,
} from '@/features/hr/talent/overview/components';

export * from '@/features/hr/talent/overview/components';
export * from '@/features/hr/talent/overview/types';

export function TalentOverviewContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-3.5 px-4 py-4 md:px-5 md:py-5">
      <PendingApprovalRequests items={pendingApprovalRequests} />
      <OverviewStatsGrid items={overviewStats} />
      <DisciplineInsights
        hotIssue={hotDisciplineIssue}
        rateSnapshot={disciplineRateSnapshot}
      />
    </main>
  );
}
