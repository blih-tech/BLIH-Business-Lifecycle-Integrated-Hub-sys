import { requestJson } from '@/features/hr/onboarding/shared/api-client';
import type {
  CreateProbationKpiDto,
  ProbationKpiResponseDto,
  UpdateProbationKpiDto,
} from '@/types';

const KPI_BASE = '/hr/probation/kpis';

export async function createProbationKpi(
  data: CreateProbationKpiDto,
): Promise<ProbationKpiResponseDto> {
  return requestJson<ProbationKpiResponseDto>(KPI_BASE, 'POST', data);
}

export async function updateProbationKpi(
  id: string,
  data: UpdateProbationKpiDto,
): Promise<ProbationKpiResponseDto> {
  return requestJson<ProbationKpiResponseDto>(
    `${KPI_BASE}/${id}`,
    'PATCH',
    data,
  );
}

export async function deleteProbationKpi(id: string): Promise<void> {
  await requestJson<void>(`${KPI_BASE}/${id}`, 'DELETE');
}

export async function getProbationKpis(
  probationId?: string,
): Promise<ProbationKpiResponseDto[]> {
  const query = probationId
    ? `?probationId=${encodeURIComponent(probationId)}`
    : '';
  return requestJson<ProbationKpiResponseDto[]>(`${KPI_BASE}${query}`);
}
