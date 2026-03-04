import {
  completedExitInterviews,
  exitInterviewStats,
  upcomingExitInterviews,
} from "@/features/hr/exit/interviews/mock-data";
import {
  CompletedExitInterviewsSection,
  InterviewStatsGrid,
  UpcomingExitInterviewsSection,
} from "@/features/hr/exit/interviews/components";

export * from "@/features/hr/exit/interviews/components";
export * from "@/features/hr/exit/interviews/types";

export function ExitInterviewsContent() {
  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-4 px-4 py-4 md:px-5 md:py-5">
      <InterviewStatsGrid items={exitInterviewStats} />
      <UpcomingExitInterviewsSection items={upcomingExitInterviews} />
      <CompletedExitInterviewsSection items={completedExitInterviews} />
    </main>
  );
}
