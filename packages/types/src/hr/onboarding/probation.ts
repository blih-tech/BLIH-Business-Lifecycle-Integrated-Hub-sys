export type ProbationPlanStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export type ProbationEvaluationRound = 'DAY_30' | 'DAY_55' | 'DAY_60_FINAL';

export type ProbationRecommendation = 'CONFIRM' | 'EXTEND' | 'TERMINATE';

export type ProbationFinalDecision = 'CONFIRM' | 'EXTEND' | 'TERMINATE';

export type ProbationConfirmationVerdict = 'CONFIRM' | 'EXTEND' | 'TERMINATE';

export interface ProbationGoalDto {
  goalId?: string;
  goal?: string;
  measure?: string;
  targetValue?: string;
  importancePercent?: number;
  notes?: string;
}

export interface ProbationDevelopmentDto {
  sessions?: unknown;
  mentorId?: string;
  milestones?: unknown;
}

export interface CreateProbationKpiPlanDto {
  userId: string;
  supervisorId?: string | null;
  probationStart: string;
  probationEnd: string;
  goals?: ProbationGoalDto[];
  development?: ProbationDevelopmentDto;
}

export interface UpdateProbationKpiPlanDto {
  goals?: ProbationGoalDto[];
  development?: ProbationDevelopmentDto;
  employeeEndorsedAt?: string | null;
  supervisorEndorsedAt?: string | null;
  hrEndorsedAt?: string | null;
  status?: ProbationPlanStatus;
}

export interface ProbationKpiPlanResponseDto {
  id: string;
  userId: string;
  supervisorId: string | null;
  probationStart: string;
  probationEnd: string;
  goals: unknown;
  development: unknown;
  employeeEndorsedAt: string | null;
  supervisorEndorsedAt: string | null;
  hrEndorsedAt: string | null;
  status: ProbationPlanStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GoalReviewDto {
  goalId?: string;
  rating?: number;
  comments?: string;
}

export interface ConductDto {
  timekeeping?: number;
  collaboration?: number;
  drive?: number;
  communication?: number;
}

export interface CreateProbationEvaluationDto {
  kpiPlanId: string;
  userId: string;
  evaluationRound: ProbationEvaluationRound;
  evaluationDate: string;
  goalReviews?: GoalReviewDto[];
  conduct?: ConductDto;
  averageRating?: number;
  supervisorRecommendation?: ProbationRecommendation;
  hrRemarks?: string;
  hrVerdict?: ProbationRecommendation;
}

export interface UpdateProbationEvaluationDto {
  employeeAcknowledgedAt?: string | null;
  supervisorApprovedAt?: string | null;
  hrApprovedAt?: string | null;
  ceoApprovedAt?: string | null;
  finalDecision?: ProbationFinalDecision | null;
  extensionDays?: number | null;
  newEndDate?: string | null;
  employeeStatusUpdatedAt?: string | null;
}

export interface ProbationEvaluationResponseDto {
  id: string;
  kpiPlanId: string;
  userId: string;
  evaluationRound: ProbationEvaluationRound;
  evaluationDate: string;
  goalReviews: unknown;
  conduct: unknown;
  averageRating: number | null;
  supervisorRecommendation: ProbationRecommendation | null;
  hrRemarks: string | null;
  hrVerdict: ProbationRecommendation | null;
  employeeAcknowledgedAt: string | null;
  supervisorApprovedAt: string | null;
  hrApprovedAt: string | null;
  ceoApprovedAt: string | null;
  finalDecision: ProbationFinalDecision | null;
  extensionDays: number | null;
  newEndDate: string | null;
  employeeStatusUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProbationConfirmationDto {
  userId: string;
  reviewSummary?: Record<string, unknown>;
  verdict: ProbationConfirmationVerdict;
  extension?: Record<string, unknown>;
  termination?: Record<string, unknown>;
  confirmation?: Record<string, unknown>;
}

export interface UpdateProbationConfirmationDto {
  hrCheckedAt?: string | null;
  ceoSignOffAt?: string | null;
  employeeNotifiedAt?: string | null;
  archivedInEmployeeFile?: boolean;
}

export interface ProbationConfirmationResponseDto {
  id: string;
  userId: string;
  reviewSummary: unknown;
  verdict: ProbationConfirmationVerdict;
  extension: unknown;
  termination: unknown;
  confirmation: unknown;
  hrCheckedAt: string | null;
  ceoSignOffAt: string | null;
  employeeNotifiedAt: string | null;
  archivedInEmployeeFile: boolean;
  createdAt: string;
  updatedAt: string;
}
