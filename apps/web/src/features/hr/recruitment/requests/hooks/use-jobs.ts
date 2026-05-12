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
type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T | null;
  error: unknown;
  meta: { timestamp: string; requestId: string; version: string };
};

export function useJobs(
  query?: JobListQueryDto,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: queryKeys.hr.jobs.list(
      query as Record<string, string> | undefined,
    ),
    queryFn: async () => {
      return apiClient.get<ApiEnvelope<JobResponseDto[]>>(
        `${API_PREFIX}`,
        query as Record<string, string> | undefined,
      );
    },
    select: (response) => response.data ?? [],
    enabled,
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: queryKeys.hr.jobs.detail(id),
    queryFn: () =>
      apiClient.get<ApiEnvelope<JobResponseDto>>(`${API_PREFIX}/${id}`),
    select: (response) => response.data,
    enabled: !!id,
  });
}

export function useCreateJob() {
  return useMutation<JobResponseDto | null, ApiError, CreateJobDto>({
    mutationFn: async (data) => {
      const response = await apiClient.post<ApiEnvelope<JobResponseDto>>(
        API_PREFIX,
        data,
      );
      return response.data;
    },
  });
}

export function useUpdateJob(id: string) {
  return useMutation<JobResponseDto | null, ApiError, UpdateJobDto>({
    mutationFn: async (data) => {
      const response = await apiClient.patch<ApiEnvelope<JobResponseDto>>(
        `${API_PREFIX}/${id}`,
        data,
      );
      return response.data;
    },
  });
}

export function useApproveJobMutation() {
  return useMutation<
    JobResponseDto | null,
    ApiError,
    {
      jobId: string;
      decision: 'APPROVED' | 'REJECTED';
      comments?: string | null;
    }
  >({
    mutationFn: async ({ jobId, decision, comments }) => {
      const response = await apiClient.post<ApiEnvelope<JobResponseDto>>(
        `${API_PREFIX}/${jobId}/approve`,
        { decision, comments: comments ?? undefined },
      );
      return response.data;
    },
  });
}

export function useCloseJob(id: string) {
  return useMutation<JobResponseDto | null, ApiError, { reason?: string }>({
    mutationFn: async (data) => {
      const response = await apiClient.post<ApiEnvelope<JobResponseDto>>(
        `${API_PREFIX}/${id}/close`,
        data,
      );
      return response.data;
    },
  });
}
