export type ReviewPeriodType = 'QUARTERLY' | 'ANNUAL';

export type ReviewStatus =
  | 'NOT_STARTED'
  | 'SELF_PENDING'
  | 'SELF_SUBMITTED'
  | 'MANAGER_PENDING'
  | 'MANAGER_SUBMITTED'
  | 'COMPLETED';

export type PerformanceCategory =
  | 'UNSATISFACTORY'
  | 'BELOW_EXPECTATIONS'
  | 'MEETS_EXPECTATIONS'
  | 'EXCEEDS_EXPECTATIONS'
  | 'OUTSTANDING';

export type PerformanceFeedbackRole =
  | 'SELF'
  | 'MANAGER'
  | 'PEER'
  | 'SKIP_LEVEL'
  | 'DIRECT_REPORT';

export interface ReviewPeriodConfigResponseDto {
  id: string;
  year: number;
  quarter: number;
  type: ReviewPeriodType;
  windowOpensAt: string;
  selfAssessmentDueAt: string;
  managerReviewDueAt: string;
  windowClosesAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewPeriodConfigDto {
  year: number;
  quarter: number;
  type?: ReviewPeriodType;
  /** If omitted, window dates are computed from quarter end (HR_LOGIC §6.1). */
  windowOpensAt?: string;
  selfAssessmentDueAt?: string;
  managerReviewDueAt?: string;
  windowClosesAt?: string;
}

export interface PerformanceReviewResponseDto {
  id: string;
  employeeId: string;
  periodConfigId: string;
  selfAssessment: unknown;
  managerReview: unknown;
  finalRating: number | null;
  category: PerformanceCategory | null;
  raiseRecommendation: unknown;
  promotionEligible: boolean;
  completedAt: string | null;
  status: ReviewStatus;
  feedbacks?: PerformanceReviewFeedbackResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePerformanceReviewDto {
  employeeId: string;
  periodConfigId: string;
}

export interface UpdateSelfAssessmentDto {
  goalRatings?: Array<{
    goalId: string;
    goal?: string;
    selfRating: number;
    evidence?: string;
  }>;
  achievements?: string;
  challenges?: string;
  supportNeeded?: string;
  careerAspirations?: string;
}

export interface UpdateManagerReviewDto {
  goalRatings?: Array<{
    goalId: string;
    managerRating: number;
    comments?: string;
  }>;
  overallRating?: number;
  strengths?: string[];
  developmentAreas?: string[];
  feedback?: string;
  recognition?: string;
}

export interface UpsertPerformanceReviewFeedbackDto {
  reviewerId: string;
  role: PerformanceFeedbackRole;
  ratings?: Record<string, unknown> | null;
  comments?: Record<string, unknown> | null;
  submittedAt?: string | null;
}

export interface PerformanceReviewFeedbackResponseDto {
  id: string;
  reviewId: string;
  reviewerId: string;
  role: PerformanceFeedbackRole;
  ratings: Record<string, unknown> | null;
  comments: Record<string, unknown> | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceCalibrationAdjustmentDto {
  reviewId: string;
  finalRating?: number | null;
  category?: PerformanceCategory | null;
  promotionEligible?: boolean;
  raiseRecommendation?: RaiseRecommendationDto | null;
  note?: string | null;
}

export interface UpsertPerformanceCalibrationDto {
  periodId: string;
  departmentId?: string | null;
  finalizedById?: string | null;
  finalizedAt?: string | null;
  adjustments?: {
    reviewAdjustments?: PerformanceCalibrationAdjustmentDto[];
    notes?: string | null;
  } | null;
}

export interface PerformanceCalibrationResponseDto {
  id: string;
  periodId: string;
  departmentId: string | null;
  adjustments: {
    reviewAdjustments?: PerformanceCalibrationAdjustmentDto[];
    notes?: string | null;
  } | null;
  finalizedById: string | null;
  finalizedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RaiseRecommendationDto {
  minPercent: number;
  maxPercent: number;
}

export interface AnnualPerformanceSummaryDto {
  employeeId: string;
  year: number;
  completedReviews: number;
  averageRating: number | null;
  latestCategory: PerformanceCategory | null;
  raiseRecommendation: RaiseRecommendationDto | null;
  promotionEligible: boolean;
  okrCompletionPercent: number | null;
}
