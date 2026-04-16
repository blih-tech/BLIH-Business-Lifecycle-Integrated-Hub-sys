'use client';

import { useApplicants } from '@/features/hr/recruitment/applicants/hooks/use-applicants';

type ApplicantManagementProps = {
  jobId?: string;
};

export function ApplicantManagement({
  jobId,
}: ApplicantManagementProps): React.ReactElement {
  const { data, isLoading, isError } = useApplicants(jobId);

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading applicants...</p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">Failed to load applicant data.</p>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold">Applicant Management</h3>
      <p className="text-sm text-muted-foreground">
        Total applicants: {data?.length ?? 0}
      </p>
    </div>
  );
}
