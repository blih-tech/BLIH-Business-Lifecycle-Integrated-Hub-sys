export type CareerDevelopmentPlanStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export type CareerGoalStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'BLOCKED';

export interface CareerDevelopmentGoalDto {
  id: string;
  title: string;
  category?: string | null;
  description?: string | null;
  targetDate?: string | null;
  linkedSkillGapId?: string | null;
  linkedTrainingRequestId?: string | null;
  status: CareerGoalStatus;
  progress: number;
  notes?: string | null;
  completedAt?: string | null;
}

export interface CareerDevelopmentPlanResponseDto {
  id: string;
  employeeId: string;
  currentPositionId: string | null;
  targetPositionId: string | null;
  planYear: number;
  title: string;
  summary: string | null;
  goals: CareerDevelopmentGoalDto[];
  developmentActions: unknown;
  successMetrics: unknown;
  progressPercent: number;
  lastProgressAt: string | null;
  completedAt: string | null;
  status: CareerDevelopmentPlanStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCareerDevelopmentPlanDto {
  employeeId: string;
  targetPositionId?: string | null;
  planYear: number;
  title: string;
  summary?: string | null;
  goals: CareerDevelopmentGoalDto[];
  developmentActions?: unknown;
  successMetrics?: unknown;
  createdById: string;
}

export interface UpdateCareerDevelopmentPlanDto {
  targetPositionId?: string | null;
  title?: string;
  summary?: string | null;
  goals?: CareerDevelopmentGoalDto[];
  developmentActions?: unknown;
  successMetrics?: unknown;
  status?: CareerDevelopmentPlanStatus;
}

export interface UpdateCareerDevelopmentProgressDto {
  status?: CareerDevelopmentPlanStatus;
  goals: Array<{
    goalId: string;
    status?: CareerGoalStatus;
    progress?: number;
    notes?: string | null;
    completedAt?: string | null;
  }>;
}
