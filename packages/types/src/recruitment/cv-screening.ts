export type ScreeningRecommendation = 'SELECT' | 'PAUSE' | 'DECLINE';

export interface AssessmentItemDto {
  factor: string;
  importance?: string;
  rating: number;
  notes?: string | null;
}

export interface CreateCvScreeningDto {
  candidateId: string;
  jobPostingId: string;
  assessments: AssessmentItemDto[];
  recommendation?: ScreeningRecommendation | null;
  nextPhase?: string | null;
}

export interface CvScreeningResponseDto {
  id: string;
  candidateId: string;
  jobPostingId: string;
  assessments: unknown;
  aggregateRating: string | null;
  recommendation: ScreeningRecommendation | null;
  nextPhase: string | null;
  screenedById: string;
  screenedByEmail?: string | null;
  screenedAt: string;
  approvedById: string | null;
  approvedAt: string | null;
  interviewScheduled: boolean;
  rejectionSent: boolean;
  createdAt: string;
  updatedAt: string;
}
