import { requestJson } from '@/features/hr/onboarding/shared/api-client';

type OnboardingChecklistStatus =
  | 'TODO'
  | 'SUBMITTED'
  | 'CHANGES_REQUESTED'
  | 'COMPLETED';

type OnboardingChecklist = {
  id: string;
  taskInstanceId: string;
  status: OnboardingChecklistStatus;
};

type OnboardingRecord = {
  id: string;
  employeeId: string;
  checklists: OnboardingChecklist[];
};

export type EmployeeFull = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  departmentName: string | null;
  employment: {
    positionTitle: string | null;
  } | null;
};

export async function getOnboardingRecords(): Promise<OnboardingRecord[]> {
  return requestJson<OnboardingRecord[]>('/hr/onboarding');
}

export async function getEmployeeFull(
  employeeId: string,
): Promise<EmployeeFull> {
  return requestJson<EmployeeFull>(`/hr/employees/${employeeId}`);
}

export async function updateChecklistStatus(
  id: string,
  status: OnboardingChecklistStatus,
) {
  return requestJson(`/hr/onboarding/checklists/${id}/status`, 'PATCH', {
    status,
  });
}
