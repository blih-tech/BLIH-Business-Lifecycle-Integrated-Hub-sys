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

export interface TrainingNeedsAssessmentResponseDto {
  id: string;
  employeeId: string;
  basedOnReviewId: string | null;
  periodYear: number;
  assessedById: string;
  developmentAreas: Array<{
    area: string;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    notes?: string | null;
  }>;
  requestedTrainings: Array<{
    title: string;
    provider?: string | null;
    trainingType?: TrainingType | null;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    estimatedCost?: number | null;
  }>;
  skillGapSummary: string | null;
  managerNotes: string | null;
  priority: string | null;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  submittedAt: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrainingNeedsAssessmentDto {
  employeeId: string;
  basedOnReviewId?: string | null;
  periodYear: number;
  assessedById: string;
  developmentAreas: Array<{
    area: string;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    notes?: string | null;
  }>;
  requestedTrainings: Array<{
    title: string;
    provider?: string | null;
    trainingType?: TrainingType | null;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    estimatedCost?: number | null;
  }>;
  skillGapSummary?: string | null;
  priority?: string | null;
  submit?: boolean;
}

export interface UpdateTrainingNeedsAssessmentDto {
  basedOnReviewId?: string | null;
  developmentAreas?: Array<{
    area: string;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    notes?: string | null;
  }>;
  requestedTrainings?: Array<{
    title: string;
    provider?: string | null;
    trainingType?: TrainingType | null;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    estimatedCost?: number | null;
  }>;
  skillGapSummary?: string | null;
  priority?: string | null;
}

export interface ReviewTrainingNeedsAssessmentDto {
  approved: boolean;
  reviewedById: string;
  managerNotes?: string | null;
  rejectionReason?: string | null;
}
