import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  bulkUpdateApplicantStatus,
  createApplicant,
  updateApplicant,
  updateApplicantStatus,
} from '@/features/hr/recruitment/applicants/api/applicants.api';
import { listApplicants } from '@/features/hr/recruitment/shared/api';
import { queryKeys } from '@/lib/query-keys';
import type {
  BulkUpdateApplicantStatusDto,
  CreateApplicantDto,
  UpdateApplicantDto,
  UpdateApplicantStatusDto,
} from '@/types';

export function useApplicants(jobId?: string) {
  return useQuery({
    queryKey: [...queryKeys.hr.recruitment(), 'applicants', jobId ?? 'all'],
    queryFn: () => listApplicants(jobId),
  });
}

export function useCreateApplicant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateApplicantDto) => createApplicant(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...queryKeys.hr.recruitment(), 'applicants'],
      });
    },
  });
}

export function useUpdateApplicant(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateApplicantDto) => updateApplicant(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...queryKeys.hr.recruitment(), 'applicants'],
      });
    },
  });
}

export function useUpdateApplicantStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateApplicantStatusDto) =>
      updateApplicantStatus(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...queryKeys.hr.recruitment(), 'applicants'],
      });
    },
  });
}

export function useBulkUpdateApplicantStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkUpdateApplicantStatusDto) =>
      bulkUpdateApplicantStatus(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...queryKeys.hr.recruitment(), 'applicants'],
      });
    },
  });
}
