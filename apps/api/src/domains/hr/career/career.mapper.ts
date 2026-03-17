import type {
  CareerDevelopmentPlanResponseDto,
  InternalTransferRequestResponseDto,
  SalaryAdjustmentRequestResponseDto,
} from '@repo/types';

function iso(value: Date | null | undefined) {
  return value?.toISOString() ?? null;
}

function dateOnly(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function num(value: unknown) {
  if (value == null) {
    return null;
  }
  if (typeof value === 'object' && value !== null && 'toNumber' in value) {
    return (value as { toNumber(): number }).toNumber();
  }
  return Number(value);
}

export function mapCareerDevelopmentPlan(plan: {
  id: string;
  employeeId: string;
  currentPositionId: string | null;
  targetPositionId: string | null;
  planYear: number;
  title: string;
  summary: string | null;
  goals: unknown;
  developmentActions: unknown;
  successMetrics: unknown;
  progressPercent: number;
  lastProgressAt: Date | null;
  completedAt: Date | null;
  status: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}): CareerDevelopmentPlanResponseDto {
  return {
    id: plan.id,
    employeeId: plan.employeeId,
    currentPositionId: plan.currentPositionId,
    targetPositionId: plan.targetPositionId,
    planYear: plan.planYear,
    title: plan.title,
    summary: plan.summary,
    goals: Array.isArray(plan.goals)
      ? (plan.goals as CareerDevelopmentPlanResponseDto['goals'])
      : [],
    developmentActions: plan.developmentActions,
    successMetrics: plan.successMetrics,
    progressPercent: plan.progressPercent,
    lastProgressAt: iso(plan.lastProgressAt),
    completedAt: iso(plan.completedAt),
    status: plan.status as CareerDevelopmentPlanResponseDto['status'],
    createdById: plan.createdById,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };
}

export function mapInternalTransferRequest(request: {
  id: string;
  requestId: string;
  employeeId: string;
  requestType: string;
  currentPositionId: string | null;
  targetPositionId: string;
  requestedById: string;
  reason: string;
  businessCase: unknown;
  desiredEffectiveDate: Date | null;
  compensationChange: unknown;
  status: string;
  submittedAt: Date | null;
  approvedById: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}): InternalTransferRequestResponseDto {
  return {
    id: request.id,
    requestId: request.requestId,
    employeeId: request.employeeId,
    requestType:
      request.requestType as InternalTransferRequestResponseDto['requestType'],
    currentPositionId: request.currentPositionId,
    targetPositionId: request.targetPositionId,
    requestedById: request.requestedById,
    reason: request.reason,
    businessCase: request.businessCase,
    desiredEffectiveDate: dateOnly(request.desiredEffectiveDate),
    compensationChange: request.compensationChange,
    status: request.status as InternalTransferRequestResponseDto['status'],
    submittedAt: iso(request.submittedAt),
    approvedById: request.approvedById,
    approvedAt: iso(request.approvedAt),
    rejectionReason: request.rejectionReason,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  };
}

export function mapSalaryAdjustmentRequest(request: {
  id: string;
  requestId: string;
  employeeId: string;
  proposedById: string;
  linkedReviewId: string | null;
  linkedTransferRequestId: string | null;
  reason: string;
  currentBaseSalary: unknown;
  proposedBaseSalary: unknown;
  percentChange: unknown;
  currency: string | null;
  effectiveFrom: Date;
  justification: unknown;
  status: string;
  submittedAt: Date | null;
  approvedById: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}): SalaryAdjustmentRequestResponseDto {
  return {
    id: request.id,
    requestId: request.requestId,
    employeeId: request.employeeId,
    proposedById: request.proposedById,
    linkedReviewId: request.linkedReviewId,
    linkedTransferRequestId: request.linkedTransferRequestId,
    reason: request.reason as SalaryAdjustmentRequestResponseDto['reason'],
    currentBaseSalary: num(request.currentBaseSalary),
    proposedBaseSalary: num(request.proposedBaseSalary) ?? 0,
    percentChange: num(request.percentChange) ?? 0,
    currency: request.currency,
    effectiveFrom: request.effectiveFrom.toISOString().slice(0, 10),
    justification: request.justification,
    status: request.status as SalaryAdjustmentRequestResponseDto['status'],
    submittedAt: iso(request.submittedAt),
    approvedById: request.approvedById,
    approvedAt: iso(request.approvedAt),
    rejectionReason: request.rejectionReason,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  };
}
