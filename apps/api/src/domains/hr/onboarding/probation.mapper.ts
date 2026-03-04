import type {
  ProbationConfirmationResponseDto,
  ProbationEvaluationResponseDto,
  ProbationKpiPlanResponseDto,
} from '@repo/types';

type ProbationPlanRow = {
  id: string;
  employeeId: string;
  supervisorId: string | null;
  probationStart: Date;
  probationEnd: Date;
  goals: unknown;
  development: unknown;
  employeeEndorsedAt: Date | null;
  supervisorEndorsedAt: Date | null;
  hrEndorsedAt: Date | null;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
};

type ProbationEvaluationRow = {
  id: string;
  kpiPlanId: string;
  employeeId: string;
  evaluationRound: 'DAY_30' | 'DAY_55' | 'DAY_60_FINAL';
  evaluationDate: Date;
  goalReviews: unknown;
  conduct: unknown;
  averageRating: { toString(): string } | null;
  supervisorRecommendation: 'CONFIRM' | 'EXTEND' | 'TERMINATE' | null;
  hrRemarks: string | null;
  hrVerdict: 'CONFIRM' | 'EXTEND' | 'TERMINATE' | null;
  employeeAcknowledgedAt: Date | null;
  supervisorApprovedAt: Date | null;
  hrApprovedAt: Date | null;
  ceoApprovedAt: Date | null;
  finalDecision: 'CONFIRM' | 'EXTEND' | 'TERMINATE' | null;
  extensionDays: number | null;
  newEndDate: Date | null;
  employeeStatusUpdatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type ProbationConfirmationRow = {
  id: string;
  employeeId: string;
  reviewSummary: unknown;
  verdict: 'CONFIRM' | 'EXTEND' | 'TERMINATE';
  extension: unknown;
  termination: unknown;
  confirmation: unknown;
  hrCheckedAt: Date | null;
  ceoSignOffAt: Date | null;
  employeeNotifiedAt: Date | null;
  archivedInEmployeeFile: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function mapProbationPlanResponse(
  row: ProbationPlanRow,
): ProbationKpiPlanResponseDto {
  return {
    id: row.id,
    employeeId: row.employeeId,
    supervisorId: row.supervisorId,
    probationStart: row.probationStart.toISOString().slice(0, 10),
    probationEnd: row.probationEnd.toISOString().slice(0, 10),
    goals: row.goals,
    development: row.development,
    employeeEndorsedAt: row.employeeEndorsedAt?.toISOString() ?? null,
    supervisorEndorsedAt: row.supervisorEndorsedAt?.toISOString() ?? null,
    hrEndorsedAt: row.hrEndorsedAt?.toISOString() ?? null,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapProbationEvaluationResponse(
  row: ProbationEvaluationRow,
): ProbationEvaluationResponseDto {
  return {
    id: row.id,
    kpiPlanId: row.kpiPlanId,
    employeeId: row.employeeId,
    evaluationRound: row.evaluationRound,
    evaluationDate: row.evaluationDate.toISOString().slice(0, 10),
    goalReviews: row.goalReviews,
    conduct: row.conduct,
    averageRating:
      row.averageRating != null ? Number(row.averageRating.toString()) : null,
    supervisorRecommendation: row.supervisorRecommendation,
    hrRemarks: row.hrRemarks,
    hrVerdict: row.hrVerdict,
    employeeAcknowledgedAt: row.employeeAcknowledgedAt?.toISOString() ?? null,
    supervisorApprovedAt: row.supervisorApprovedAt?.toISOString() ?? null,
    hrApprovedAt: row.hrApprovedAt?.toISOString() ?? null,
    ceoApprovedAt: row.ceoApprovedAt?.toISOString() ?? null,
    finalDecision: row.finalDecision,
    extensionDays: row.extensionDays,
    newEndDate: row.newEndDate?.toISOString().slice(0, 10) ?? null,
    employeeStatusUpdatedAt: row.employeeStatusUpdatedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapProbationConfirmationResponse(
  row: ProbationConfirmationRow,
): ProbationConfirmationResponseDto {
  return {
    id: row.id,
    employeeId: row.employeeId,
    reviewSummary: row.reviewSummary,
    verdict: row.verdict,
    extension: row.extension,
    termination: row.termination,
    confirmation: row.confirmation,
    hrCheckedAt: row.hrCheckedAt?.toISOString() ?? null,
    ceoSignOffAt: row.ceoSignOffAt?.toISOString() ?? null,
    employeeNotifiedAt: row.employeeNotifiedAt?.toISOString() ?? null,
    archivedInEmployeeFile: row.archivedInEmployeeFile,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
