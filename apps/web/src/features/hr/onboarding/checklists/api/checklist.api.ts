import { requestJson } from '@/features/hr/onboarding/shared/api-client';

type ChecklistStatus = 'TODO' | 'SUBMITTED' | 'CHANGES_REQUESTED' | 'COMPLETED';

type OnboardingRecord = {
  employeeId: string;
  checklists: Array<{
    id: string;
    taskInstanceId: string;
    status: ChecklistStatus;
    dueDate?: string | null;
  }>;
};

export async function getChecklists() {
  const records = await requestJson<OnboardingRecord[]>('/hr/onboarding');

  return records.flatMap((record) =>
    record.checklists.map((item) => ({
      id: item.id,
      status: item.status,
      dueDate: item.dueDate ?? null,
      taskInstanceId: item.taskInstanceId,
      taskId: item.id,
      type: 'done',
      employeeId: record.employeeId,
    })),
  );
}

export async function submitChecklist(taskId: string, type?: string) {
  void type;
  await requestJson(`/hr/onboarding/checklists/${taskId}/status`, 'PATCH', {
    status: 'SUBMITTED',
  });
}

export async function approveChecklist(taskId: string, type?: string) {
  void type;
  await requestJson(`/hr/onboarding/checklists/${taskId}/status`, 'PATCH', {
    status: 'COMPLETED',
  });
}

export async function rejectChecklist(taskId: string, type?: string) {
  void type;
  await requestJson(`/hr/onboarding/checklists/${taskId}/status`, 'PATCH', {
    status: 'CHANGES_REQUESTED',
  });
}
