import { emptyReadyToPostMessage } from '@/features/hr/recruitment/ready-to-post/mock-data';
import {
  ReadyToPostJobsSection,
  ReadyToPostEmptyState,
} from '@/features/hr/recruitment/ready-to-post/components';
import { useJobs } from '@/features/hr/recruitment/requests/hooks';
import { mapJobsToRequests } from '@/features/hr/recruitment/shared/mappers';

export * from '@/features/hr/recruitment/ready-to-post/components';
export * from '@/features/hr/recruitment/ready-to-post/types';

export function RecruitmentReadyToPostContent() {
  const { data: jobs = [] } = useJobs({ status: 'READY_TO_POST' });
  const readyToPostJobs = mapJobsToRequests(jobs, '');

  return (
    <main className="mx-auto w-full max-w-[960px] space-y-4 px-4 py-5 md:px-5 md:py-6">
      <section className="space-y-1">
        <h1 className="ui-section-title text-foreground">Jobs Ready to Post</h1>
        <p className="ui-body text-muted-foreground">
          Review and publish job postings
        </p>
      </section>

      <ReadyToPostJobsSection items={readyToPostJobs} />

      {readyToPostJobs.length === 0 ? (
        <ReadyToPostEmptyState message={emptyReadyToPostMessage} />
      ) : null}
    </main>
  );
}
