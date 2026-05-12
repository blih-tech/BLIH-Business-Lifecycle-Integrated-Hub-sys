import { useMutation, useQuery } from '@tanstack/react-query';

import { apiClient, ApiError } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';

import type {
  ApplicantListQueryDto,
  ApplicantResponseDto,
  UpdateApplicantStatusDto,
} from '@repo/types/recruitment/applicants';
import type {
  InterviewListQueryDto,
  InterviewResponseDto,
} from '@repo/types/recruitment/interviews';

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T | null;
  error: unknown;
  meta: { timestamp: string; requestId: string; version: string };
};

export function useApplicants(
  query?: ApplicantListQueryDto,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [...queryKeys.hr.recruitment(), 'applicants', query] as const,
    queryFn: async () =>
      apiClient.get<ApiEnvelope<ApplicantResponseDto[]>>(
        '/hr/recruitment/applicants',
        query as Record<string, string> | undefined,
      ),
    select: (response) => response.data ?? [],
    enabled: options?.enabled ?? true,
  });
}

export function useInterviews(
  query?: InterviewListQueryDto,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [...queryKeys.hr.recruitment(), 'interviews', query] as const,
    queryFn: async () =>
      apiClient.get<ApiEnvelope<InterviewResponseDto[]>>(
        '/hr/recruitment/interviews',
        query as Record<string, string> | undefined,
      ),
    select: (response) => response.data ?? [],
    enabled: options?.enabled ?? true,
  });
}

export function useUpdateApplicantStatusMutation() {
  return useMutation<
    ApplicantResponseDto | null,
    ApiError,
    { applicantId: string; payload: UpdateApplicantStatusDto }
  >({
    mutationFn: async ({ applicantId, payload }) => {
      const response = await apiClient.post<ApiEnvelope<ApplicantResponseDto>>(
        `/hr/recruitment/applicants/${applicantId}/status`,
        payload,
      );
      return response.data;
    },
  });
}
