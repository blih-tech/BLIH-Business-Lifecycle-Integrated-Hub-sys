import type {
  ResignationResponseDto,
  OffboardingChecklistResponseDto,
  OffboardingTaskResponseDto,
  ExitInterviewResponseDto,
  FinalSettlementResponseDto,
  AssetReturnResponseDto,
  ComplianceChecklistResponseDto,
} from '@repo/types';

function dateStr(d: Date | null): string | null {
  return d ? d.toISOString().slice(0, 10) : null;
}
function decNum(d: { toNumber?: () => number } | number | null): number | null {
  if (d == null) return null;
  return typeof d === 'number'
    ? d
    : ((d as { toNumber: () => number }).toNumber?.() ?? null);
}

export function mapResignation(row: {
  id: string;
  employeeId: string;
  proposedLastDay: Date;
  actualLastDay: Date | null;
  reason: string | null;
  reasonNotes: string | null;
  submittedAt: Date | null;
  approvedById: string | null;
  status: string;
  handoverPlan: unknown;
  criticalProjectsWarning: unknown;
  leaveBalanceOptions: unknown;
  validationResult: unknown;
  createdAt: Date;
  updatedAt: Date;
}): ResignationResponseDto {
  return {
    id: row.id,
    employeeId: row.employeeId,
    proposedLastDay: dateStr(row.proposedLastDay)!,
    actualLastDay: dateStr(row.actualLastDay),
    reason: row.reason,
    reasonNotes: row.reasonNotes,
    submittedAt: row.submittedAt?.toISOString() ?? null,
    approvedById: row.approvedById,
    status: row.status as ResignationResponseDto['status'],
    handoverPlan: row.handoverPlan,
    criticalProjectsWarning: row.criticalProjectsWarning,
    leaveBalanceOptions: row.leaveBalanceOptions,
    validationResult: row.validationResult,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapOffboardingTask(row: {
  id: string;
  checklistId: string;
  department: string;
  title: string;
  dueDate: Date;
  assignedToId: string | null;
  status: string;
  completedAt: Date | null;
  completedById: string | null;
  mandatory: boolean;
}): OffboardingTaskResponseDto {
  return {
    id: row.id,
    checklistId: row.checklistId,
    department: row.department as OffboardingTaskResponseDto['department'],
    title: row.title,
    dueDate: dateStr(row.dueDate)!,
    assignedToId: row.assignedToId,
    status: row.status as OffboardingTaskResponseDto['status'],
    completedAt: row.completedAt?.toISOString() ?? null,
    completedById: row.completedById,
    mandatory: row.mandatory,
  };
}

export function mapOffboardingChecklist(row: {
  id: string;
  employeeId: string;
  resignationId: string;
  lastWorkingDay: Date;
  status: string;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tasks?: Array<Parameters<typeof mapOffboardingTask>[0]>;
}): OffboardingChecklistResponseDto {
  return {
    id: row.id,
    employeeId: row.employeeId,
    resignationId: row.resignationId,
    lastWorkingDay: dateStr(row.lastWorkingDay)!,
    status: row.status as OffboardingChecklistResponseDto['status'],
    completedAt: row.completedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    tasks: (row.tasks ?? []).map(mapOffboardingTask),
  };
}

export function mapExitInterview(row: {
  id: string;
  employeeId: string;
  resignationId: string;
  conductedById: string | null;
  conductedAt: Date | null;
  questions: unknown;
  answers: unknown;
  wouldRecommend: boolean | null;
  wouldReturn: boolean | null;
  improvementNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ExitInterviewResponseDto {
  return {
    id: row.id,
    employeeId: row.employeeId,
    resignationId: row.resignationId,
    conductedById: row.conductedById,
    conductedAt: row.conductedAt?.toISOString() ?? null,
    questions: row.questions,
    answers: row.answers,
    wouldRecommend: row.wouldRecommend,
    wouldReturn: row.wouldReturn,
    improvementNotes: row.improvementNotes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapFinalSettlement(row: {
  id: string;
  employeeId: string;
  resignationId: string;
  lastWorkingDay: Date;
  earnings: unknown;
  deductions: unknown;
  netPayable: unknown;
  breakdownDocumentUrl: string | null;
  approvedById: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): FinalSettlementResponseDto {
  return {
    id: row.id,
    employeeId: row.employeeId,
    resignationId: row.resignationId,
    lastWorkingDay: dateStr(row.lastWorkingDay)!,
    earnings: (row.earnings ?? {}) as FinalSettlementResponseDto['earnings'],
    deductions: (row.deductions ??
      {}) as FinalSettlementResponseDto['deductions'],
    netPayable: Number(
      decNum(row.netPayable as { toNumber?: () => number }) ?? 0,
    ),
    breakdownDocumentUrl: row.breakdownDocumentUrl,
    approvedById: row.approvedById,
    paidAt: row.paidAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapAssetReturn(row: {
  id: string;
  employeeId: string;
  checklistId: string;
  items: unknown;
  depositReturn: unknown;
  damageDeductions: unknown;
  netAmount: unknown;
  itSignOffAt: Date | null;
  adminSignOffAt: Date | null;
  financeSignOffAt: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): AssetReturnResponseDto {
  return {
    id: row.id,
    employeeId: row.employeeId,
    checklistId: row.checklistId,
    items: row.items,
    depositReturn: decNum(row.depositReturn as { toNumber?: () => number }),
    damageDeductions: decNum(
      row.damageDeductions as { toNumber?: () => number },
    ),
    netAmount: decNum(row.netAmount as { toNumber?: () => number }),
    itSignOffAt: row.itSignOffAt?.toISOString() ?? null,
    adminSignOffAt: row.adminSignOffAt?.toISOString() ?? null,
    financeSignOffAt: row.financeSignOffAt?.toISOString() ?? null,
    status: row.status as AssetReturnResponseDto['status'],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapComplianceChecklist(row: {
  id: string;
  employeeId: string;
  resignationId: string;
  terminationType: string;
  noticePeriodContractual: number | null;
  noticePeriodActual: number | null;
  payInLieu: boolean | null;
  finalDues: unknown;
  terminationLetterSent: boolean;
  exitInterviewDone: boolean;
  clearanceCertificateDone: boolean;
  unionNotified: boolean;
  laborOfficeFiled: boolean;
  noPendingClaims: boolean;
  verifiedById: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): ComplianceChecklistResponseDto {
  return {
    id: row.id,
    employeeId: row.employeeId,
    resignationId: row.resignationId,
    terminationType:
      row.terminationType as ComplianceChecklistResponseDto['terminationType'],
    noticePeriodContractual: row.noticePeriodContractual,
    noticePeriodActual: row.noticePeriodActual,
    payInLieu: row.payInLieu,
    finalDues: row.finalDues,
    terminationLetterSent: row.terminationLetterSent,
    exitInterviewDone: row.exitInterviewDone,
    clearanceCertificateDone: row.clearanceCertificateDone,
    unionNotified: row.unionNotified,
    laborOfficeFiled: row.laborOfficeFiled,
    noPendingClaims: row.noPendingClaims,
    verifiedById: row.verifiedById,
    verifiedAt: row.verifiedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
