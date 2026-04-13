import { OnboardingMember } from '../types';
import type { EmployeeFull } from '../api/progress.api';

type OnboardingChecklist = {
  id: string;
  status: 'TODO' | 'SUBMITTED' | 'CHANGES_REQUESTED' | 'COMPLETED';
};

type OnboardingRecord = {
  employeeId: string;
  checklists: OnboardingChecklist[];
};

export function mapTasksToMembers(
  records: OnboardingRecord[],
  employees: Record<string, EmployeeFull>,
): OnboardingMember[] {
  return records.map((record) => {
    const employee = employees[record.employeeId];
    const fullName = getFullName(employee);

    const totalTasks = record.checklists.length;
    const completedTasks = record.checklists.filter(
      (item) => item.status === 'COMPLETED',
    ).length;
    const completionPercent =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      id: record.employeeId,
      name: fullName,
      role: employee?.employment?.positionTitle || 'Unknown Role',
      department: employee?.departmentName || 'Unknown Dept',
      avatarText: getInitials(fullName),
      completionPercent,
      completedTasks,
      totalTasks,
      checklist: record.checklists.map((item, index) => ({
        id: item.id,
        label: `Task ${index + 1}`,
        done: item.status === 'COMPLETED',
      })),
    };
  });
}

function getFullName(employee?: EmployeeFull): string {
  if (!employee) return 'Unknown';
  const fullName = [employee.firstName, employee.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  return fullName || 'Unknown';
}

function getInitials(name?: string) {
  if (!name) return 'NA';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('');
}
