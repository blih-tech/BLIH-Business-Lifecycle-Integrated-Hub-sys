type ReviewPeriodConfigRow = {
  id: string;
  year: number;
  quarter: number;
  type: string;
  windowOpensAt: Date;
  selfAssessmentDueAt: Date;
  managerReviewDueAt: Date;
  windowClosesAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

type PerformanceReviewFeedbackRow = {
  id: string;
  reviewId: string;
  reviewerId: string;
  role: string;
  ratings: unknown;
  comments: unknown;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type PerformanceReviewRow = {
  id: string;
  employeeId: string;
  periodConfigId: string;
  selfAssessment: unknown;
  managerReview: unknown;
  finalRating: unknown;
  category: string | null;
  raiseRecommendation: unknown;
  promotionEligible: boolean;
  completedAt: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  feedbackEntries?: PerformanceReviewFeedbackRow[];
};

type PerformanceCalibrationRow = {
  id: string;
  periodId: string;
  departmentId: string | null;
  adjustments: unknown;
  finalizedById: string | null;
  finalizedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function decimalToNumber(value: unknown): number | null {
  if (value == null) {
    return null;
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'toNumber' in (value as object)
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

export function mapReviewPeriodConfigResponse(row: ReviewPeriodConfigRow) {
  return {
    id: row.id,
    year: row.year,
    quarter: row.quarter,
    type: row.type,
    windowOpensAt: row.windowOpensAt.toISOString(),
    selfAssessmentDueAt: row.selfAssessmentDueAt.toISOString(),
    managerReviewDueAt: row.managerReviewDueAt.toISOString(),
    windowClosesAt: row.windowClosesAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapPerformanceReviewFeedbackResponse(
  row: PerformanceReviewFeedbackRow,
) {
  return {
    id: row.id,
    reviewId: row.reviewId,
    reviewerId: row.reviewerId,
    role: row.role,
    ratings:
      row.ratings && typeof row.ratings === 'object'
        ? (row.ratings as Record<string, unknown>)
        : null,
    comments:
      row.comments && typeof row.comments === 'object'
        ? (row.comments as Record<string, unknown>)
        : null,
    submittedAt: row.submittedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapPerformanceReviewResponse(row: PerformanceReviewRow) {
  return {
    id: row.id,
    employeeId: row.employeeId,
    periodConfigId: row.periodConfigId,
    selfAssessment: row.selfAssessment,
    managerReview: row.managerReview,
    finalRating: decimalToNumber(row.finalRating),
    category: row.category,
    raiseRecommendation: row.raiseRecommendation,
    promotionEligible: row.promotionEligible,
    completedAt: row.completedAt?.toISOString() ?? null,
    status: row.status,
    feedbacks: row.feedbackEntries?.map(mapPerformanceReviewFeedbackResponse),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapPerformanceCalibrationResponse(
  row: PerformanceCalibrationRow,
) {
  return {
    id: row.id,
    periodId: row.periodId,
    departmentId: row.departmentId,
    adjustments:
      row.adjustments && typeof row.adjustments === 'object'
        ? (row.adjustments as {
            reviewAdjustments?: Array<Record<string, unknown>>;
            notes?: string | null;
          })
        : null,
    finalizedById: row.finalizedById,
    finalizedAt: row.finalizedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
