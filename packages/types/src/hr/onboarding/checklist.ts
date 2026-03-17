export type OnboardingChecklistStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE';

export type OnboardingTaskDepartment = 'HR' | 'IT' | 'ADMIN' | 'TEAM';

export type OnboardingTaskStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE';

export interface CreateOnboardingChecklistDto {
  employeeId: string;
  onboardingId?: string | null;
  offerId?: string | null;
  joinDate: string;
  overseerId?: string | null;
  ceoSignOffRequired?: boolean;
  /** If true, tasks are auto-generated from template based on employment type/role */
  generateTasksFromTemplate?: boolean;
}

export interface UpdateOnboardingChecklistDto {
  status?: OnboardingChecklistStatus;
  teamLeadVerifiedAt?: string | null;
  ceoSignOffAt?: string | null;
}

export interface OnboardingTaskResponseDto {
  id: string;
  checklistId: string;
  department: OnboardingTaskDepartment;
  title: string;
  description: string | null;
  dueDate: string | null;
  assignedToId: string | null;
  status: OnboardingTaskStatus;
  completedAt: string | null;
  completedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOnboardingTaskDto {
  status?: OnboardingTaskStatus;
  completedAt?: string | null;
  completedById?: string | null;
}

export interface OnboardingChecklistResponseDto {
  id: string;
  employeeId: string;
  onboardingId: string | null;
  offerId: string | null;
  joinDate: string;
  overseerId: string | null;
  totalItems: number;
  completedItems: number;
  status: OnboardingChecklistStatus;
  teamLeadVerifiedAt: string | null;
  ceoSignOffRequired: boolean;
  ceoSignOffAt: string | null;
  createdAt: string;
  updatedAt: string;
  tasks?: OnboardingTaskResponseDto[];
}
