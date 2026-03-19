import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type {
  CreateJobDto,
  JobListQueryDto,
  JobResponseDto,
  UpdateJobDto,
} from '@/types';

const API_PREFIX = '/hr/recruitment/jobs';

export function useJobs(query?: JobListQueryDto) {
  return useQuery({
    queryKey: queryKeys.hr.jobs.list(query as Record<string, string> | undefined),
    queryFn: () => apiClient.get<JobResponseDto[]>(`${API_PREFIX}`, query as Record<string, string> | undefined),
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
