import { requestJson } from '@/features/hr/onboarding/shared/api-client';

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
