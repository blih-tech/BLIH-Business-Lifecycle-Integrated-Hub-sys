import { requestJson } from '@/features/hr/onboarding/shared/api-client';
import type { CreateProbationDto, UpdateProbationDto } from '@/types';

export type ProbationPlan = {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  kpis: Array<{ id: string; kpiName: string }>;
  checkpoints: Array<{ id: string; name: string; checkpointDate: string }>;
};

export type FinalEvaluation = {
  totalScore: number;
};

export type EmployeeFull = {
  firstName: string | null;
  lastName: string | null;
  departmentName: string | null;
  employment: {
    positionTitle: string | null;
  } | null;
};

export async function getProbations(): Promise<ProbationPlan[]> {
  return requestJson<ProbationPlan[]>('/hr/probation');
}

export async function getProbationById(id: string): Promise<ProbationPlan> {
  return requestJson<ProbationPlan>(`/hr/probation/${id}`);
}

export async function createProbation(
  data: CreateProbationDto,
): Promise<ProbationPlan> {
  return requestJson<ProbationPlan>('/hr/probation', 'POST', data);
}

export async function updateProbation(
  id: string,
  data: UpdateProbationDto,
): Promise<ProbationPlan> {
  return requestJson<ProbationPlan>(`/hr/probation/${id}`, 'PATCH', data);
}

export async function deleteProbation(id: string): Promise<void> {
  await requestJson<void>(`/hr/probation/${id}`, 'DELETE');
}

export async function getEmployeeFull(
  employeeId: string,
): Promise<EmployeeFull> {
  return requestJson<EmployeeFull>(`/hr/employees/${employeeId}`);
}

export async function getFinalEvaluation(probationId: string) {
  try {
    return await requestJson<FinalEvaluation>(
      `/hr/probation/final-evaluations/by-probation/${probationId}`,
    );
  } catch {
    return null;
  }
}
