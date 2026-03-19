'use client';

import { useMemo } from 'react';

import {
  emptyRequestsMessage,
  requestStats,
} from '@/features/hr/recruitment/requests/mock-data';
import {
  EmptyRequestsState,
  RequestsSection,
  RequestsStatsCard,
  RequestsErrorState,
} from '@/features/hr/recruitment/requests/components';
import { useJobs } from '@/features/hr/recruitment/requests/hooks';
import { mapJobResponseToRequest } from '@/features/hr/recruitment/requests/job-request-mappers';

export * from '@/features/hr/recruitment/requests/components';
export * from '@/features/hr/recruitment/requests/types';
export * from '@/features/hr/recruitment/requests/hooks';

type RecruitmentRequestsContentProps = {
  currentUserName: string;
};

export function RecruitmentRequestsContent({
  currentUserName,
}: RecruitmentRequestsContentProps) {
  const { data: jobs, isLoading, isError, refetch } = useJobs();

  const normalizedRequests = useMemo(() => {
    if (!jobs) return [];
    return jobs.map((job) => {
      const workflow = job.requestForm?.status?.workflow;
      const requestedBy = job.requestForm?.requestedBy ?? '';
      const isByMe =
        requestedBy.trim().toLowerCase() ===
        currentUserName.trim().toLowerCase();

      if (workflow === 'REJECTED') {
        return mapJobResponseToRequest(job, 'closed');
      }

      if (workflow === 'PENDING_FOR_APPROVAL') {
        return mapJobResponseToRequest(job, isByMe ? 'by_me' : 'active');
      }

      return mapJobResponseToRequest(job, 'posted');
    });
  }, [currentUserName, jobs]);

  const pendingRequests = normalizedRequests.filter(
    (request) => request.status === 'active',
  );
  const pendingByMeRequests = normalizedRequests.filter(
    (request) => request.status === 'by_me',
  );
  const declinedRequests = normalizedRequests.filter(
    (request) => request.status === 'closed',
  );
  const hasRequests = normalizedRequests.length > 0;

  return (
    <main className="mx-auto w-full max-w-[960px] space-y-8 px-4 py-5 md:px-5 md:py-6">
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {requestStats.map((item) => (
          <RequestsStatsCard key={item.id} item={item} />
        ))}
      </section>

      {isError ? (
        <RequestsErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <RequestsSection
            title="Pending Approval Requests"
            subtitle="Review and publish job postings"
            items={pendingRequests}
            currentUserName={currentUserName}
            isLoading={isLoading}
          />

          <RequestsSection
            title="Approved by You"
            subtitle="Waiting for other approvals"
            items={pendingByMeRequests}
            currentUserName={currentUserName}
            isLoading={isLoading}
          />

          <RequestsSection
            title="Declined Job Postings"
            subtitle="Completed recruitment processes and hires"
            items={declinedRequests}
            currentUserName={currentUserName}
            includeFilter
            isLoading={isLoading}
          />

          {!isLoading && !hasRequests ? (
            <EmptyRequestsState message={emptyRequestsMessage} />
          ) : null}
        </>
      )}
    </main>
  );
}
