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
  probationPlanId: string;
  employeeId: string;
  round: 'DAY_30' | 'DAY_55' | 'DAY_60_FINAL';
  evaluationDate: Date;
  strengths: unknown;
  improvements: unknown;
  overallScore: { toString(): string } | null;
  recommendation: 'CONFIRM' | 'EXTEND' | 'TERMINATE';
  evaluatorComments: string | null;
  employeeComments: string | null;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
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
    kpiPlanId: row.probationPlanId,
    employeeId: row.employeeId,
    evaluationRound: row.round,
    evaluationDate: row.evaluationDate.toISOString().slice(0, 10),
    goalReviews: row.strengths,
    conduct: row.improvements,
    averageRating:
      row.overallScore != null ? Number(row.overallScore.toString()) : null,
    supervisorRecommendation: row.recommendation,
    hrRemarks: row.evaluatorComments,
    hrVerdict: row.recommendation,
    employeeAcknowledgedAt: null,
    supervisorApprovedAt: null,
    hrApprovedAt:
      row.status === 'APPROVED' ? row.updatedAt.toISOString() : null,
    ceoApprovedAt: null,
    finalDecision: row.recommendation,
    extensionDays: null,
    newEndDate: null,
    employeeStatusUpdatedAt: null,
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
