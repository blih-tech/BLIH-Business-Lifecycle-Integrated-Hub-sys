import type {
  SkillResponseDto,
  EmployeeSkillResponseDto,
  TrainingBudgetResponseDto,
  TrainingRequestResponseDto,
  TrainingCompletionResponseDto,
  SkillGapAssessmentResponseDto,
} from '@repo/types';

function dec(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === 'object' && v !== null && 'toNumber' in (v as object))
    return (v as { toNumber: () => number }).toNumber();
  return Number(v);
}

export function mapSkillResponse(row: {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}): SkillResponseDto {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapEmployeeSkillResponse(row: {
  id: string;
  userId: string;
  skillId: string;
  level: string;
  attestedAt: Date | null;
  source: string;
  createdAt: Date;
  updatedAt: Date;
  skill?: { name: string };
}): EmployeeSkillResponseDto {
  return {
    id: row.id,
    userId: row.userId,
    skillId: row.skillId,
    skillName: row.skill?.name,
    level: row.level as EmployeeSkillResponseDto['level'],
    attestedAt: row.attestedAt?.toISOString() ?? null,
    source: row.source as EmployeeSkillResponseDto['source'],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapTrainingBudgetResponse(row: {
  id: string;
  departmentId: string;
  year: number;
  totalBudget: unknown;
  usedYtd: unknown;
  perPersonAmount: unknown;
  createdAt: Date;
  updatedAt: Date;
}): TrainingBudgetResponseDto {
  const total = dec(row.totalBudget);
  const used = dec(row.usedYtd);
  const perPerson =
    row.perPersonAmount != null ? dec(row.perPersonAmount) : null;
  return {
    id: row.id,
    departmentId: row.departmentId,
    year: row.year,
    totalBudget: total,
    usedYtd: used,
    perPersonAmount: perPerson,
    remaining: Math.max(0, total - used),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapTrainingRequestResponse(row: {
  id: string;
  userId: string;
  departmentId: string;
  trainingType: string;
  title: string;
  provider: string | null;
  startDate: Date | null;
  endDate: Date | null;
  durationHours: number | null;
  justification: string | null;
  skillGapLinkId: string | null;
  cost: unknown;
  costPayer: string | null;
  status: string;
  submittedAt: Date | null;
  approvedById: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}): TrainingRequestResponseDto {
  return {
    id: row.id,
    userId: row.userId,
    departmentId: row.departmentId,
    trainingType:
      row.trainingType as TrainingRequestResponseDto['trainingType'],
    title: row.title,
    provider: row.provider,
    startDate: row.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: row.endDate?.toISOString().slice(0, 10) ?? null,
    durationHours: row.durationHours,
    justification: row.justification,
    skillGapLinkId: row.skillGapLinkId,
    cost: row.cost != null ? dec(row.cost) : null,
    costPayer: row.costPayer as TrainingRequestResponseDto['costPayer'],
    status: row.status as TrainingRequestResponseDto['status'],
    submittedAt: row.submittedAt?.toISOString() ?? null,
    approvedById: row.approvedById,
    approvedAt: row.approvedAt?.toISOString() ?? null,
    rejectionReason: row.rejectionReason,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapTrainingCompletionResponse(row: {
  id: string;
  userId: string;
  trainingRequestId: string | null;
  title: string;
  provider: string | null;
  startDate: Date | null;
  endDate: Date | null;
  completionStatus: string;
  scoreOrGrade: string | null;
  certificateNumber: string | null;
  certificateUrl: string | null;
  expiryDate: Date | null;
  skillsAcquired: unknown;
  attestedAt: Date | null;
  syncedToProfile: boolean;
  createdAt: Date;
  updatedAt: Date;
}): TrainingCompletionResponseDto {
  return {
    id: row.id,
    userId: row.userId,
    trainingRequestId: row.trainingRequestId,
    title: row.title,
    provider: row.provider,
    startDate: row.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: row.endDate?.toISOString().slice(0, 10) ?? null,
    completionStatus:
      row.completionStatus as TrainingCompletionResponseDto['completionStatus'],
    scoreOrGrade: row.scoreOrGrade,
    certificateNumber: row.certificateNumber,
    certificateUrl: row.certificateUrl,
    expiryDate: row.expiryDate?.toISOString().slice(0, 10) ?? null,
    skillsAcquired: Array.isArray(row.skillsAcquired)
      ? row.skillsAcquired
      : null,
    attestedAt: row.attestedAt?.toISOString() ?? null,
    syncedToProfile: row.syncedToProfile,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapSkillGapAssessmentResponse(row: {
  id: string;
  departmentId: string;
  assessedById: string;
  assessedAt: Date;
  requiredSkills: unknown;
  currentState: unknown;
  criticalGapsSummary: string | null;
  trainingRecommendations: unknown;
  hireRecommendations: unknown;
  createdAt: Date;
  updatedAt: Date;
}): SkillGapAssessmentResponseDto {
  return {
    id: row.id,
    departmentId: row.departmentId,
    assessedById: row.assessedById,
    assessedAt: row.assessedAt.toISOString(),
    requiredSkills: Array.isArray(row.requiredSkills) ? row.requiredSkills : [],
    currentState: Array.isArray(row.currentState) ? row.currentState : [],
    criticalGapsSummary: row.criticalGapsSummary,
    trainingRecommendations: Array.isArray(row.trainingRecommendations)
      ? row.trainingRecommendations
      : null,
    hireRecommendations: row.hireRecommendations,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
