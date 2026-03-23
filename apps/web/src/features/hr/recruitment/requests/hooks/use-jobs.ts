import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type {
  CreateJobDto,
  JobListQueryDto,
  JobResponseDto,
  UpdateJobDto,
} from '@/types';
import { delay } from '@/shared/lib/demo-utils';
import { mockListJobsResponse } from '@/features/hr/recruitment/requests/mock-api';

const API_PREFIX = '/hr/recruitment/jobs';

export function useJobs(query?: JobListQueryDto) {
  return useQuery({
    queryKey: queryKeys.hr.jobs.list(query as Record<string, string> | undefined),
    queryFn: async () => {
      // Live API call (disabled for now)
      // return apiClient.get<ListJobsResponse>(
      //   `${API_PREFIX}`,
      //   query as Record<string, string> | undefined,
      // );

      await delay(1200);
      return mockListJobsResponse;
    },
    select: (response) => response.data ?? [],
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: queryKeys.hr.jobs.detail(id),
    queryFn: () => apiClient.get<JobResponseDto>(`${API_PREFIX}/${id}`),
    enabled: !!id,
  });
}

export function useCreateJob() {
  return useMutation<
    JobResponseDto,
    ApiError,
    CreateJobDto
  >({
    mutationFn: (data) => apiClient.post<JobResponseDto>(API_PREFIX, data),
  });
}

export function useUpdateJob(id: string) {
  return useMutation<
    JobResponseDto,
    ApiError,
    UpdateJobDto
  >({
    mutationFn: (data) => apiClient.patch<JobResponseDto>(`${API_PREFIX}/${id}`, data),
  });
}

export function useApproveJob(id: string) {
  return useMutation<
    JobResponseDto,
    ApiError,
    { decision: 'APPROVED' | 'REJECTED'; comments?: string }
  >({
    mutationFn: (data) => apiClient.post<JobResponseDto>(`${API_PREFIX}/${id}/approve`, data),
  });
}

export function useCloseJob(id: string) {
  return useMutation<
    JobResponseDto,
    ApiError,
    { reason?: string }
  >({
    mutationFn: (data) => apiClient.post<JobResponseDto>(`${API_PREFIX}/${id}/close`, data),
  });
}
