import {
  departmentBudgetUtilization,
  monthlyPayrollTrend,
  workforceNotifications,
  workforceOverviewStats,
  workforcePendingApprovals,
  workforceQuickActions,
} from '@/features/hr/workforce/overview/mock-data';
import {
  PendingApprovalsSection,
  RecentNotificationsSection,
  WorkforceChartsSection,
  WorkforceOverviewStatsGrid,
  WorkforceQuickActionsSection,
} from '@/features/hr/workforce/overview/components';

export * from '@/features/hr/workforce/overview/components';
export * from '@/features/hr/workforce/overview/types';

export function WorkforceOverviewContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-4 px-4 py-4 md:px-5 md:py-5">
      <WorkforceOverviewStatsGrid items={workforceOverviewStats} />
      <RecentNotificationsSection items={workforceNotifications} />
      <PendingApprovalsSection items={workforcePendingApprovals} />
      <WorkforceChartsSection
        monthlyPayrollData={monthlyPayrollTrend}
        budgetUtilizationData={departmentBudgetUtilization}
      />
      <WorkforceQuickActionsSection items={workforceQuickActions} />
    </main>
  );
}
