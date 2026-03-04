import type { OffboardingTaskDepartment } from '@repo/types';

export interface TaskMatrixEntry {
  department: OffboardingTaskDepartment;
  title: string;
  deadlineDays: number;
  mandatory: boolean;
}

export const OFFBOARDING_TASK_MATRIX: TaskMatrixEntry[] = [
  {
    department: 'HR',
    title: 'Conduct exit interview',
    deadlineDays: -3,
    mandatory: true,
  },
  {
    department: 'HR',
    title: 'Process final settlement',
    deadlineDays: 0,
    mandatory: true,
  },
  {
    department: 'HR',
    title: 'Prepare experience certificate',
    deadlineDays: 0,
    mandatory: true,
  },
  {
    department: 'HR',
    title: 'Update employee status to RESIGNED',
    deadlineDays: 0,
    mandatory: true,
  },
  {
    department: 'HR',
    title: 'Archive employee file',
    deadlineDays: 7,
    mandatory: true,
  },
  {
    department: 'IT',
    title: 'Revoke email access',
    deadlineDays: 0,
    mandatory: true,
  },
  {
    department: 'IT',
    title: 'Revoke system access',
    deadlineDays: 0,
    mandatory: true,
  },
  {
    department: 'IT',
    title: 'Backup user data',
    deadlineDays: -1,
    mandatory: true,
  },
  {
    department: 'IT',
    title: 'Transfer code ownership',
    deadlineDays: -3,
    mandatory: true,
  },
  {
    department: 'ADMIN',
    title: 'Collect access badges',
    deadlineDays: 0,
    mandatory: true,
  },
  {
    department: 'ADMIN',
    title: 'Process asset returns',
    deadlineDays: 0,
    mandatory: true,
  },
  {
    department: 'ADMIN',
    title: 'Update phone directory',
    deadlineDays: 1,
    mandatory: true,
  },
  {
    department: 'FINANCE',
    title: 'Calculate final settlement',
    deadlineDays: -1,
    mandatory: true,
  },
  {
    department: 'FINANCE',
    title: 'Process final payment',
    deadlineDays: 0,
    mandatory: true,
  },
  {
    department: 'FINANCE',
    title: 'Close expense account',
    deadlineDays: 1,
    mandatory: true,
  },
  {
    department: 'FINANCE',
    title: 'Reconcile advances',
    deadlineDays: -1,
    mandatory: true,
  },
  {
    department: 'MANAGER',
    title: 'Approve knowledge transfer',
    deadlineDays: -3,
    mandatory: true,
  },
  {
    department: 'MANAGER',
    title: 'Reassign projects/tasks',
    deadlineDays: -5,
    mandatory: true,
  },
  {
    department: 'MANAGER',
    title: 'Complete handover checklist',
    deadlineDays: 0,
    mandatory: true,
  },
];

function addBusinessDays(date: Date, days: number): Date {
  const d = new Date(date);
  let remaining = Math.abs(days);
  const step = days >= 0 ? 1 : -1;
  while (remaining > 0) {
    d.setDate(d.getDate() + step);
    const day = d.getDay();
    if (day !== 0 && day !== 6) remaining--;
  }
  return d;
}

export function getTaskDueDate(
  lastWorkingDay: Date,
  deadlineDays: number,
): Date {
  return addBusinessDays(lastWorkingDay, deadlineDays);
}
