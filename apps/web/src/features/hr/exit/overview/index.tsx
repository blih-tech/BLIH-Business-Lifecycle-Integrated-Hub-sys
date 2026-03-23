import {
  activeResignationNotifications,
  activeResignations,
  departmentAttritionData,
  exitOverviewStats,
  resignationTrendData,
  topExitReasons,
} from '@/features/hr/exit/overview/mock-data';
import {
  ActiveResignationNotificationsSection,
  ActiveResignationsOverviewSection,
  DepartmentAttritionAnalysisSection,
  ExitOverviewStatsGrid,
  TurnoverInsightsSection,
} from '@/features/hr/exit/overview/components';

export * from '@/features/hr/exit/overview/components';
export * from '@/features/hr/exit/overview/types';

export function ExitOverviewContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-8 px-4 py-4 md:px-5 md:py-5">
      <ExitOverviewStatsGrid items={exitOverviewStats} />
      <ActiveResignationNotificationsSection
        items={activeResignationNotifications}
      />
      <ActiveResignationsOverviewSection items={activeResignations} />
      <TurnoverInsightsSection
        reasons={topExitReasons}
        trendData={resignationTrendData}
      />
      <DepartmentAttritionAnalysisSection items={departmentAttritionData} />
    </main>
  );
}
