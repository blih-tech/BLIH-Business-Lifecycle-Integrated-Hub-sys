import { apiClient } from '@/lib/api-client';
import type {
  ApplicantResponseDto,
  BulkUpdateApplicantStatusDto,
  CreateApplicantDto,
  UpdateApplicantDto,
  UpdateApplicantStatusDto,
} from '@/types';

const APPLICANTS_BASE = '/hr/recruitment/applicants';

export async function createApplicant(
  data: CreateApplicantDto,
): Promise<ApplicantResponseDto> {
  return apiClient.post<ApplicantResponseDto>(APPLICANTS_BASE, data);
}

export async function updateApplicant(
  id: string,
  data: UpdateApplicantDto,
): Promise<ApplicantResponseDto> {
  return apiClient.patch<ApplicantResponseDto>(
    `${APPLICANTS_BASE}/${id}`,
    data,
  );
}

export async function updateApplicantStatus(
  id: string,
  data: UpdateApplicantStatusDto,
): Promise<void> {
  await apiClient.post(`${APPLICANTS_BASE}/${id}/status`, data);
}

export async function bulkUpdateApplicantStatus(
  data: BulkUpdateApplicantStatusDto,
): Promise<void> {
  await apiClient.post(`${APPLICANTS_BASE}/bulk-status`, data);
}
