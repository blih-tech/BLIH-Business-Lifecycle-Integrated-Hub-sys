'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  JobApprovalPermissions,
  JobPermissions,
} from '@repo/types/rbac/permissions.constants';

import { CreateRequestDialog } from '@/features/hr/recruitment/requests/components/create-request-dialog';
import { JobRequestDetailsDialog } from '@/features/hr/recruitment/requests/components/job-request-details-dialog';
import { JobRequestCard } from '@/features/hr/recruitment/requests/components/job-request-card';
import { JobRequestJustifyDialog } from '@/features/hr/recruitment/requests/components/job-request-justify-dialog';
import { JobRequestCardSkeleton } from '@/features/hr/recruitment/requests/components/job-request-card-skeleton';
import {
  useApproveJobMutation,
  useSubmitJobMutation,
} from '@/features/hr/recruitment/requests/hooks/use-jobs';
import type {
  FullJobRequest,
  JobRequestPriority,
} from '@/features/hr/recruitment/requests/types';
import { queryKeys } from '@/lib/query-keys';
import { useHrAbility } from '@/shared/auth/hr-ability-context';
import { notifyPermissionDenied } from '@/shared/components/access/notify-permission-denied';
import { toast } from 'sonner';

type JobRequestsSectionProps = {
  items: FullJobRequest[];
  currentUserName: string;
  isLoading?: boolean;
};

export function JobRequestsSection({
  items,
  currentUserName,
  isLoading = false,
}: JobRequestsSectionProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { hasPermission } = useHrAbility();
  const approveJob = useApproveJobMutation();
  const submitJob = useSubmitJobMutation();

  const canDecideApproval = hasPermission(JobApprovalPermissions.DECIDE);
  const canSubmitForApproval = hasPermission(JobPermissions.SUBMIT);
  const canEditJob = hasPermission(JobPermissions.UPDATE);
  const canCreateJob = hasPermission(JobPermissions.CREATE);

  const [selectedRequestIndex, setSelectedRequestIndex] = useState<
    number | null
  >(null);
  const [justifyRequestIndex, setJustifyRequestIndex] = useState<number | null>(
    null,
  );
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(
    null,
  );
  const [submittingJustifyAction, setSubmittingJustifyAction] = useState<
    'review' | 'reject' | null
  >(null);
  const [editRequest, setEditRequest] = useState<FullJobRequest | null>(null);
  const isCreateRequestDialogOpen =
    searchParams.get('create') === 'new-request';
  const requestPriorityOrder: JobRequestPriority[] = ['high', 'medium', 'low'];

  const createIntent = searchParams.get('create');

  useEffect(() => {
    if (createIntent !== 'new-request' || canCreateJob) return;
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('create');
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    notifyPermissionDenied(
      'You do not have permission to create hiring requests.',
    );
  }, [canCreateJob, createIntent, pathname, router, searchParams]);

  const filteredItems = useMemo(() => items, [items]);
  const filteredRequestEntries = useMemo(
    () =>
      filteredItems.map((request) => ({
        request,
        requestId: `REQ-${String(items.indexOf(request) + 1).padStart(3, '0')}`,
      })),
    [filteredItems, items],
  );

  const selectedRequest = useMemo(
    () =>
      selectedRequestIndex === null
        ? null
        : (filteredRequestEntries[selectedRequestIndex]?.request ?? null),
    [filteredRequestEntries, selectedRequestIndex],
  );
  const justifyRequest = useMemo(
    () =>
      justifyRequestIndex === null
        ? null
        : (filteredRequestEntries[justifyRequestIndex]?.request ?? null),
    [filteredRequestEntries, justifyRequestIndex],
  );
  const justifyRequestId = useMemo(
    () =>
      justifyRequestIndex === null
        ? null
        : (filteredRequestEntries[justifyRequestIndex]?.requestId ?? null),
    [filteredRequestEntries, justifyRequestIndex],
  );

  useEffect(() => {
    if (
      selectedRequestIndex !== null &&
      !filteredRequestEntries[selectedRequestIndex]
    ) {
      setSelectedRequestIndex(null);
    }
    if (
      justifyRequestIndex !== null &&
      !filteredRequestEntries[justifyRequestIndex]
    ) {
      setJustifyRequestIndex(null);
    }
  }, [filteredRequestEntries, justifyRequestIndex, selectedRequestIndex]);

  function handleCreateRequestDialogOpenChange(isOpen: boolean) {
    if (isOpen) return;
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('create');
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  function handleEditRequestDialogOpenChange(isOpen: boolean) {
    if (isOpen) return;
    setEditRequest(null);
  }

  async function handleApprove() {
    if (!canDecideApproval) {
      notifyPermissionDenied();
      return;
    }
    if (!selectedRequest?.jobId) {
      toast.error('Unable to approve this request.');
      return;
    }

    setApprovingRequestId(selectedRequest.jobId);
    try {
      await approveJob.mutateAsync({
        jobId: selectedRequest.jobId,
        decision: 'APPROVED',
      });
      toast.success('Approval submitted');
      setSelectedRequestIndex(null);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.hr.jobs.all(),
      });
    } catch (error) {
      console.error('Failed to approve job request:', error);
      toast.error('Approval failed');
    } finally {
      setApprovingRequestId(null);
    }
  }

  async function handleCardApprove(request: FullJobRequest) {
    if (!canDecideApproval) {
      notifyPermissionDenied();
      return;
    }
    if (!request.jobId) {
      toast.error('Unable to approve this request.');
      return;
    }

    setApprovingRequestId(request.jobId);
    try {
      await approveJob.mutateAsync({
        jobId: request.jobId,
        decision: 'APPROVED',
      });
      toast.success('Approval submitted');
      await queryClient.invalidateQueries({
        queryKey: queryKeys.hr.jobs.all(),
      });
    } catch (error) {
      console.error('Failed to approve job request:', error);
      toast.error('Approval failed');
    } finally {
      setApprovingRequestId(null);
    }
  }

  async function handleCardSubmitForApproval(request: FullJobRequest) {
    if (!canSubmitForApproval) {
      notifyPermissionDenied();
      return;
    }
    if (!request.jobId) {
      toast.error('Unable to submit this request.');
      return;
    }

    setApprovingRequestId(request.jobId);
    try {
      await submitJob.mutateAsync({ jobId: request.jobId });
      toast.success('Submitted for approval');
      await queryClient.invalidateQueries({
        queryKey: queryKeys.hr.jobs.all(),
      });
    } catch (error) {
      console.error('Failed to submit job request:', error);
      toast.error('Submit failed');
    } finally {
      setApprovingRequestId(null);
    }
  }

  async function handleJustify(
    action: 'review' | 'reject',
    justification: string,
  ) {
    if (!canDecideApproval) {
      notifyPermissionDenied();
      return;
    }
    const request = justifyRequest;
    if (!request?.jobId) {
      toast.error('Unable to submit this request.');
      return;
    }

    setSubmittingJustifyAction(action);
    try {
      const comments =
        action === 'review'
          ? `REVISION_REQUEST: ${justification}`
          : justification;

      await approveJob.mutateAsync({
        jobId: request.jobId,
        decision: 'REJECTED',
        comments,
      });
      toast.success(
        action === 'review' ? 'Revision requested' : 'Request declined',
      );
      setJustifyRequestIndex(null);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.hr.jobs.all(),
      });
    } catch (error) {
      console.error('Failed to submit justification:', error);
      toast.error('Request failed');
    } finally {
      setSubmittingJustifyAction(null);
    }
  }

  return (
    <>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <JobRequestCardSkeleton key={`request-skeleton-${index}`} />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filteredRequestEntries.map(({ request }, index) => (
            // Drafts are submitted into the approval workflow; non-drafts are approved/justified by approvers.
            <JobRequestCard
              key={`${request.requestForm.jobTitle}-${index}`}
              item={request}
              priority={
                requestPriorityOrder[index % requestPriorityOrder.length] ??
                'low'
              }
              onClick={() => setSelectedRequestIndex(index)}
              onJustifyClick={() => setJustifyRequestIndex(index)}
              onPrimaryActionClick={() =>
                request.status === 'drafts'
                  ? handleCardSubmitForApproval(request)
                  : handleCardApprove(request)
              }
              primaryActionLabel={
                request.status === 'drafts' ? 'Submit for approval' : 'Approve'
              }
              isApproving={approvingRequestId === request.jobId}
              showApprovalActions={
                request.status === 'drafts'
                  ? canSubmitForApproval
                  : canDecideApproval
              }
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-10 text-center">
          <p className="text-sm font-semibold text-foreground">No requests</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No requests are available for this section yet.
          </p>
        </div>
      )}

      {!isLoading ? (
        <JobRequestDetailsDialog
          request={selectedRequest}
          currentUserName={currentUserName}
          variant={selectedRequest?.status ?? 'active'}
          onOpenChange={(isOpen) => {
            if (!isOpen) setSelectedRequestIndex(null);
          }}
          onApprove={handleApprove}
          onJustify={() => {
            setSelectedRequestIndex(null);
            setJustifyRequestIndex(selectedRequestIndex);
          }}
          onEdit={() => {
            const request = selectedRequest;
            setSelectedRequestIndex(null);
            if (request) setEditRequest(request);
          }}
          isApproving={approvingRequestId === selectedRequest?.jobId}
          canDecideApproval={canDecideApproval}
          canEditJob={canEditJob}
        />
      ) : null}

      {!isLoading ? (
        <JobRequestJustifyDialog
          request={justifyRequest}
          requestId={justifyRequestId}
          onOpenChange={(isOpen) => {
            if (!isOpen) setJustifyRequestIndex(null);
          }}
          onSubmit={handleJustify}
          submittingAction={submittingJustifyAction}
        />
      ) : null}

      {!isLoading ? (
        <CreateRequestDialog
          open={isCreateRequestDialogOpen}
          onOpenChange={handleCreateRequestDialogOpenChange}
          currentUserName={currentUserName}
        />
      ) : null}

      {!isLoading ? (
        <CreateRequestDialog
          open={editRequest !== null}
          onOpenChange={handleEditRequestDialogOpenChange}
          currentUserName={currentUserName}
          editRequest={editRequest ?? undefined}
        />
      ) : null}
    </>
  );
}
