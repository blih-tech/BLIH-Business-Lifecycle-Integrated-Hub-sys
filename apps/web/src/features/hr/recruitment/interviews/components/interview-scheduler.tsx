'use client';

import { useInterviews } from '@/features/hr/recruitment/requests/hooks';

type InterviewSchedulerProps = {
  jobId?: string;
};

export function InterviewScheduler({
  jobId,
}: InterviewSchedulerProps): React.ReactElement {
  const { data, isLoading, isError } = useInterviews(jobId);

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading interviews...</p>
    );
  }
  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Failed to load interview schedule.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold">Interview Scheduler</h3>
      <p className="text-sm text-muted-foreground">
        Scheduled interviews: {data?.length ?? 0}
      </p>
    </div>
  );
}
