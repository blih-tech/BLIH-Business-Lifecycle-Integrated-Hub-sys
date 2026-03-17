export type SuccessionReadiness = 'READY_NOW' | 'ONE_YEAR' | 'TWO_YEARS';

export type SuccessionRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SuccessionPlanResponseDto {
  id: string;
  positionId: string;
  candidateEmployeeId: string;
  readiness: SuccessionReadiness;
  riskLevel: SuccessionRiskLevel;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSuccessionPlanDto {
  positionId: string;
  candidateEmployeeId: string;
  readiness: SuccessionReadiness;
  riskLevel: SuccessionRiskLevel;
  notes?: string | null;
}

export interface UpdateSuccessionPlanDto {
  readiness?: SuccessionReadiness;
  riskLevel?: SuccessionRiskLevel;
  notes?: string | null;
}

export type PromotionProposalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PromotionProposalResponseDto {
  id: string;
  employeeId: string;
  fromPositionId: string | null;
  toPositionId: string | null;
  proposedById: string;
  justification: Record<string, unknown> | null;
  status: PromotionProposalStatus;
  approvedById: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionProposalDto {
  employeeId: string;
  toPositionId: string;
  proposedById: string;
  justification?: Record<string, unknown> | null;
}

export interface ReviewPromotionProposalDto {
  status: Extract<PromotionProposalStatus, 'APPROVED' | 'REJECTED'>;
  approvedById: string;
  approvedAt?: string | null;
  compensationAdjustment?: {
    baseSalary?: string;
    currency?: string;
    effectiveFrom?: string;
    changeReason?: string;
  } | null;
}
