import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  useJobs,
  usePublishJobMutation,
} from '@/features/hr/recruitment/requests/hooks/use-jobs';
import { mapJobResponseToRequest } from '@/features/hr/recruitment/requests/job-request-mappers';
import type { ReadyToPostJob } from '@/features/hr/recruitment/ready-to-post/types';
import {
  ReadyToPostEmptyState,
  ReadyToPostJobsSection,
} from '@/features/hr/recruitment/ready-to-post/components';
import { queryKeys } from '@/lib/query-keys';

export * from '@/features/hr/recruitment/ready-to-post/components';
export * from '@/features/hr/recruitment/ready-to-post/types';

export function RecruitmentReadyToPostContent() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useJobs({
    status: 'READY_TO_POST',
  });
  const publishMutation = usePublishJobMutation();

  const readyToPostJobs = useMemo<ReadyToPostJob[]>(
    () => (data ?? []).map((job) => mapJobResponseToRequest(job, 'posted')),
    [data],
  );

  async function handlePublish(item: ReadyToPostJob): Promise<void> {
    if (!item.jobId) {
      toast.error('Unable to publish job: missing job id.');
      return;
    }
    try {
      await publishMutation.mutateAsync({ jobId: item.jobId });
      toast.success('Job published successfully.');
      await queryClient.invalidateQueries({
        queryKey: queryKeys.hr.jobs.all(),
      });
    } catch (error) {
      console.error('Failed to publish job', error);
      toast.error('Failed to publish job.');
    }
  }

  return (
    <main className="mx-auto w-full max-w-[960px] space-y-4 px-4 py-5 md:px-5 md:py-6">
      <section className="space-y-1">
        <h1 className="ui-section-title text-foreground">Jobs Ready to Post</h1>
        <p className="ui-body text-muted-foreground">
          Review and publish job postings
        </p>
      </section>

      {isError ? (
        <ReadyToPostEmptyState message="Failed to load ready-to-post jobs. Retry from the requests page." />
      ) : (
        <ReadyToPostJobsSection
          items={readyToPostJobs}
          onPostJob={handlePublish}
        />
      )}

      {!isLoading && readyToPostJobs.length === 0 ? (
        <ReadyToPostEmptyState message="No jobs ready for post." />
      ) : null}
    </main>
  );
}
