import {
  rootOverviewPendingActions,
  rootOverviewRecentActivities,
  rootOverviewStats,
} from '@/features/hr/root-overview/mock-data';
import {
  PendingActions,
  RecentActivities,
  StatsGrid,
} from '@/features/hr/root-overview/components';

export * from '@/features/hr/root-overview/components';
export * from '@/features/hr/root-overview/types';

export function HrRootOverviewContent() {
  return (
    <main className="mx-auto w-full max-w-[960px] space-y-4 px-4 py-5 md:px-5 md:py-6">
      <StatsGrid items={rootOverviewStats} />
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentActivities items={rootOverviewRecentActivities} />
        <PendingActions items={rootOverviewPendingActions} />
      </section>
    </main>
  );
}
