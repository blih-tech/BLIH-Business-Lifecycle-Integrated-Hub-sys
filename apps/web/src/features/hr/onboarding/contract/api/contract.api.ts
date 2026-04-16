import { requestJson } from '@/features/hr/onboarding/shared/api-client';
import type { EmploymentContract } from '../types';

type OnboardingChecklist = {
  id: string;
  status: EmploymentContract['status'];
};

type OnboardingRecord = {
  employeeId: string;
  checklists: OnboardingChecklist[];
};

type EmployeeFull = {
  firstName: string | null;
  lastName: string | null;
  departmentName: string | null;
  employment: {
    positionTitle: string | null;
    hiredAt: string | null;
    probationEndAt: string | null;
  } | null;
};

export async function getContracts(): Promise<EmploymentContract[]> {
  const records = await requestJson<OnboardingRecord[]>('/hr/onboarding');

  const contracts = await Promise.all(
    records.flatMap((record) =>
      record.checklists.map(async (checklist) => {
        let employee: EmployeeFull | null = null;
        try {
          employee = await requestJson<EmployeeFull>(
            `/hr/employees/${record.employeeId}`,
          );
        } catch {
          employee = null;
        }

        const fullName =
          [employee?.firstName, employee?.lastName]
            .filter(Boolean)
            .join(' ')
            .trim() || 'Unknown';

        return {
          id: checklist.id,
          taskId: checklist.id,
          status: checklist.status,
          name: fullName,
          role: employee?.employment?.positionTitle || 'Unknown Role',
          department: employee?.departmentName || 'Unknown Dept',
          avatarText:
            fullName
              .split(' ')
              .filter(Boolean)
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() || 'NA',
          offerSentOn: employee?.employment?.hiredAt
            ? new Date(employee.employment.hiredAt).toLocaleDateString()
            : '-',
          roleSummary: 'Onboarding contract checklist task.',
          responsibilities: [
            'Review the attached employment terms',
            'Confirm onboarding details are accurate',
            'Submit the contract for verification',
          ],
          overview: {
            startDate: employee?.employment?.hiredAt
              ? new Date(employee.employment.hiredAt).toLocaleDateString()
              : '-',
            workHours: '40 hrs/wk',
            probationPeriod: employee?.employment?.probationEndAt
              ? `Until ${new Date(employee.employment.probationEndAt).toLocaleDateString()}`
              : 'N/A',
            salaryPayroll: '-',
          },
        } satisfies EmploymentContract;
      }),
    ),
  );

  return contracts;
}

export async function submitContract(taskId: string, contractId: string) {
  void contractId;
  await requestJson(`/hr/onboarding/checklists/${taskId}/status`, 'PATCH', {
    status: 'SUBMITTED',
  });
}

export async function verifyContract(taskId: string, approved: boolean) {
  await requestJson(`/hr/onboarding/checklists/${taskId}/status`, 'PATCH', {
    status: approved ? 'COMPLETED' : 'CHANGES_REQUESTED',
  });
}
