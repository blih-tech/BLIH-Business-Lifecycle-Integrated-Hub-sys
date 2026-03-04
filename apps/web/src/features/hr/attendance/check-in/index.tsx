import { StatsGrid } from "@/features/hr/attendance/overview/components";
import { attendanceCheckinStats } from "@/features/hr/attendance/check-in/mock-data";

import { DailyCheckinsSection } from "./components";

export * from "@/features/hr/attendance/check-in/components";
export * from "@/features/hr/attendance/check-in/types";

export function AttendanceCheckInContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-12 px-4 py-4 md:px-5 md:py-5">
      <StatsGrid items={attendanceCheckinStats} />
      <DailyCheckinsSection />
    </main>
  );
}
