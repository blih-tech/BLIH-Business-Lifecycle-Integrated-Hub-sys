export type TrainingRequestStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type TrainingType = 'SKILL' | 'COMPLIANCE' | 'LEADERSHIP' | 'OTHER';
export type CostPayer = 'COMPANY' | 'SELF';

export interface TrainingRequestResponseDto {
  id: string;
  employeeId: string;
  departmentId: string;
  trainingType: TrainingType;
  title: string;
  provider: string | null;
  startDate: string | null;
  endDate: string | null;
  durationHours: number | null;
  justification: string | null;
  skillGapLinkId: string | null;
  cost: number | null;
  costPayer: CostPayer | null;
  status: TrainingRequestStatus;
  submittedAt: string | null;
  approvedById: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrainingRequestDto {
  employeeId: string;
  departmentId: string;
  trainingType: TrainingType;
  title: string;
  provider?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  durationHours?: number | null;
  justification?: string | null;
  skillGapLinkId?: string | null;
  cost?: number | null;
  costPayer?: CostPayer | null;
  submit?: boolean;
}

export interface ApproveTrainingRequestDto {
  approved: boolean;
  rejectionReason?: string | null;
}
