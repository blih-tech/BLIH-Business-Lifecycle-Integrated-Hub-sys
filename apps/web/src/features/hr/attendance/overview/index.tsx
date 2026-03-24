import {
  ActivityChart,
  PerformanceCard,
  StatsGrid,
} from '@/features/hr/attendance/overview/components';
import {
  activityPresenceData,
  attendanceStats,
  performanceCards,
} from '@/features/hr/attendance/overview/mock-data';

export * from '@/features/hr/attendance/overview/components';
export * from '@/features/hr/attendance/overview/types';

export function AttendanceOverviewContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-4 px-4 py-4 md:px-5 md:py-5">
      <StatsGrid items={attendanceStats} />

      <section className="rounded-[12px] border border-border bg-white p-4">
        <p className="text-sm tracking-[-0.3125px] text-black">
          Work Hours Performance
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {performanceCards.map((stat) => (
            <PerformanceCard key={stat.id} stat={stat} />
          ))}
        </div>
      </section>

      <ActivityChart data={activityPresenceData} />
    </main>
  );
}
