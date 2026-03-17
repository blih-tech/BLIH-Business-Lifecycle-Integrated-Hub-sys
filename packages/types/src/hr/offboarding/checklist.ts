export type OffboardingTaskDepartment = 'HR' | 'IT' | 'ADMIN' | 'FINANCE' | 'MANAGER';
export type OffboardingTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
export type OffboardingChecklistStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface OffboardingTaskResponseDto {
  id: string;
  checklistId: string;
  department: OffboardingTaskDepartment;
  title: string;
  dueDate: string;
  assignedToId: string | null;
  status: OffboardingTaskStatus;
  completedAt: string | null;
  completedById: string | null;
  mandatory: boolean;
}

export interface OffboardingChecklistResponseDto {
  id: string;
  employeeId: string;
  resignationId: string;
  lastWorkingDay: string;
  status: OffboardingChecklistStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tasks: OffboardingTaskResponseDto[];
}

export interface CompleteOffboardingTaskDto {
  status: OffboardingTaskStatus;
  completedById?: string | null;
}
