import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type {
  ApplicantResponseDto,
  CreateJobDto,
  InterviewResponseDto,
  JobListQueryDto,
  JobResponseDto,
  ListJobsResponse,
  OfferResponseDto,
  ScreenCandidatesEnvelope,
  UpdateJobDto,
} from '@/types';

const API_PREFIX = '/hr/recruitment/jobs';

export function useJobs(query?: JobListQueryDto) {
  return useQuery({
    queryKey: queryKeys.hr.jobs.list(
      query as Record<string, string> | undefined,
    ),
    queryFn: async () => {
      return apiClient.get<ListJobsResponse>(
        `${API_PREFIX}`,
        query as Record<string, string> | undefined,
      );
    },
    select: (response) => response.data ?? [],
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: queryKeys.hr.jobs.detail(id),
    queryFn: () =>
      apiClient
        .get<{ data: JobResponseDto }>(`${API_PREFIX}/${id}`)
        .then((res) => res.data),
    enabled: !!id,
  });
}

export function useApplicants(jobId?: string) {
  return useQuery({
    queryKey: [...queryKeys.hr.recruitment(), 'applicants', jobId ?? 'all'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: ApplicantResponseDto[] }>(
        '/hr/recruitment/applicants',
        jobId ? { jobId } : undefined,
      );
      return res.data ?? [];
    },
  });
}

export function useInterviews(jobId?: string) {
  return useQuery({
    queryKey: [...queryKeys.hr.recruitment(), 'interviews', jobId ?? 'all'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: InterviewResponseDto[] }>(
        '/hr/recruitment/interviews',
        jobId ? { jobId } : undefined,
      );
      return res.data ?? [];
    },
  });
}

export function useOffers(jobId?: string) {
  return useQuery({
    queryKey: [...queryKeys.hr.recruitment(), 'offers', jobId ?? 'all'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: OfferResponseDto[] }>(
        '/hr/recruitment/offers',
        jobId ? { jobId } : undefined,
      );
      return res.data ?? [];
    },
  });
}

export function useScreenCandidates(jobId?: string) {
  return useQuery({
    queryKey: [...queryKeys.hr.recruitment(), 'brain-screen', jobId ?? 'none'],
    enabled: Boolean(jobId),
    queryFn: async () => {
      if (!jobId) return {};
      const res = await apiClient.post<ScreenCandidatesEnvelope>(
        '/brain/screen-candidates',
        { jobId },
      );
      return Object.fromEntries(
        (res.data?.rankedApplicants ?? []).map((row) => [
          row.candidateId,
          row.score,
        ]),
      ) as Record<string, number>;
    },
  });
}

export function useCreateJob() {
  return useMutation<JobResponseDto, ApiError, CreateJobDto>({
    mutationFn: (data) => apiClient.post<JobResponseDto>(API_PREFIX, data),
  });
}

export function useUpdateJob(id: string) {
  return useMutation<JobResponseDto, ApiError, UpdateJobDto>({
    mutationFn: (data) =>
      apiClient.patch<JobResponseDto>(`${API_PREFIX}/${id}`, data),
  });
}

export function useApproveJob(id: string) {
  return useMutation<
    JobResponseDto,
    ApiError,
    { decision: 'APPROVED' | 'REJECTED'; comments?: string }
  >({
    mutationFn: (data) =>
      apiClient.post<JobResponseDto>(`${API_PREFIX}/${id}/approve`, data),
  });
}

export function useCloseJob(id: string) {
  return useMutation<JobResponseDto, ApiError, { reason?: string }>({
    mutationFn: (data) =>
      apiClient.post<JobResponseDto>(`${API_PREFIX}/${id}/close`, data),
  });
}
