'use client';

import { useMemo } from 'react';

import {
  EmptyRequestsState,
  RequestsSection,
  RequestsStatsCard,
  RequestsErrorState,
} from '@/features/hr/recruitment/requests/components';
import { useJobs } from '@/features/hr/recruitment/requests/hooks';
import { mapJobResponseToRequest } from '@/features/hr/recruitment/requests/job-request-mappers';
import { useHrAbility } from '@/shared/auth/hr-ability-context';
import { JobPermissions } from '@repo/types/rbac/permissions.constants';
import { PermissionGate } from '@/shared/components/access/permission-gate';
import type { RequestsStatItem } from '@/features/hr/recruitment/requests/types';

export * from '@/features/hr/recruitment/requests/components';
export * from '@/features/hr/recruitment/requests/types';
export * from '@/features/hr/recruitment/requests/hooks';

type RecruitmentRequestsContentProps = {
  currentUserName: string;
};

export function RecruitmentRequestsContent({
  currentUserName,
}: RecruitmentRequestsContentProps) {
  const { hasPermission } = useHrAbility();
  const canListJobs = hasPermission(JobPermissions.VIEW);
  const {
    data: jobs,
    isLoading,
    isError,
    refetch,
  } = useJobs(undefined, {
    enabled: canListJobs,
  });

  const normalizedRequests = useMemo(() => {
    if (!jobs) return [];
    return jobs.map((job) => {
      const workflow = job.requestForm?.status?.workflow;
      const requestedBy = job.requestForm?.requestedBy ?? '';
      const isByMe =
        requestedBy.trim().toLowerCase() ===
        currentUserName.trim().toLowerCase();

      if (workflow === 'DRAFT') {
        return mapJobResponseToRequest(job, 'drafts');
      }

      if (workflow === 'REJECTED') {
        return mapJobResponseToRequest(job, 'closed');
      }

      if (workflow === 'PENDING_FOR_APPROVAL') {
        return mapJobResponseToRequest(job, isByMe ? 'by_me' : 'active');
      }

      if (workflow === 'READY_TO_POST' || workflow === 'PUBLISHED') {
        return mapJobResponseToRequest(job, 'posted');
      }

      if (workflow === 'CLOSED') {
        return mapJobResponseToRequest(job, 'closed');
      }

      return mapJobResponseToRequest(job, 'drafts');
    });
  }, [currentUserName, jobs]);

  const draftRequests = normalizedRequests.filter(
    (request) => request.status === 'drafts',
  );
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
  const stats: RequestsStatItem[] = useMemo(
    () => [
      {
        id: 'drafts',
        label: 'Drafts',
        value: String(draftRequests.length),
        icon: 'pending',
      },
      {
        id: 'pending',
        label: 'Pending approval',
        value: String(pendingRequests.length),
        icon: 'pending',
      },
      {
        id: 'closed',
        label: 'Closed / declined',
        value: String(declinedRequests.length),
        icon: 'open_positions',
      },
    ],
    [declinedRequests.length, draftRequests.length, pendingRequests.length],
  );

  return (
    <main className="mx-auto w-full max-w-[960px] space-y-8 px-4 py-5 md:px-5 md:py-6">
      <PermissionGate anyOf={[JobPermissions.VIEW]}>
        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {stats.map((item) => (
            <RequestsStatsCard key={item.id} item={item} />
          ))}
        </section>

        {isError ? (
          <RequestsErrorState onRetry={() => refetch()} />
        ) : (
          <>
            <RequestsSection
              title="Draft Requests"
              subtitle="Submit your created jobs for approval"
              items={draftRequests}
              currentUserName={currentUserName}
              isLoading={isLoading}
            />

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
              <EmptyRequestsState message="No job requests found." />
            ) : null}
          </>
        )}
      </PermissionGate>
    </main>
  );
}
