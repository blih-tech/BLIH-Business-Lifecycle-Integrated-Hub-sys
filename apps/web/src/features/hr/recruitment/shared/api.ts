import { apiClient } from '@/lib/api-client';
import type {
  ApplicantResponseDto,
  InterviewResponseDto,
  JobListQueryDto,
  JobResponseDto,
  ListApplicantsResponse,
  ListInterviewsResponse,
  ListJobsResponse,
  ListOffersResponse,
  OfferResponseDto,
  ScreenCandidatesEnvelope,
} from '@/types';

const JOBS_BASE = '/hr/recruitment/jobs';
const APPLICANTS_BASE = '/hr/recruitment/applicants';
const INTERVIEWS_BASE = '/hr/recruitment/interviews';
const OFFERS_BASE = '/hr/recruitment/offers';
const BRAIN_BASE = '/brain';

export async function listJobs(
  query?: JobListQueryDto,
): Promise<JobResponseDto[]> {
  const params = query
    ? (Object.fromEntries(
        Object.entries(query).filter(([, value]) => value !== undefined),
      ) as Record<string, string>)
    : undefined;
  const response = await apiClient.get<ListJobsResponse>(JOBS_BASE, params);
  return response.data ?? [];
}

export async function listApplicants(
  jobId?: string,
): Promise<ApplicantResponseDto[]> {
  const response = await apiClient.get<ListApplicantsResponse>(
    APPLICANTS_BASE,
    jobId ? { jobId } : undefined,
  );
  return response.data ?? [];
}

export async function listInterviews(
  jobId?: string,
): Promise<InterviewResponseDto[]> {
  const response = await apiClient.get<ListInterviewsResponse>(
    INTERVIEWS_BASE,
    jobId ? { jobId } : undefined,
  );
  return response.data ?? [];
}

export async function listOffers(jobId?: string): Promise<OfferResponseDto[]> {
  const response = await apiClient.get<ListOffersResponse>(
    OFFERS_BASE,
    jobId ? { jobId } : undefined,
  );
  return response.data ?? [];
}

export async function screenCandidates(
  jobId: string,
): Promise<Record<string, number>> {
  try {
    const response = await apiClient.post<ScreenCandidatesEnvelope>(
      `${BRAIN_BASE}/screen-candidates`,
      { jobId },
    );
    const ranked = response.data?.rankedApplicants ?? [];
    return Object.fromEntries(
      ranked.map((item) => [item.candidateId, item.score]),
    );
  } catch {
    return {};
  }
}
