import { attendanceTimesheetStats } from '@/features/hr/attendance/timesheet/mock-data';
import { StatsGrid } from '@/features/hr/attendance/overview/components';

import { DailyTimesheetSection } from './components';

export * from '@/features/hr/attendance/timesheet/components';
export * from '@/features/hr/attendance/timesheet/types';

export function AttendanceTimesheetContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-12 px-4 py-4 md:px-5 md:py-5">
      <StatsGrid items={attendanceTimesheetStats} />
      <DailyTimesheetSection />
    </main>
  );
}
