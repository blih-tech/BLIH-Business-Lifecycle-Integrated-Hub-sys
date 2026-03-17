import type { TrainingNeedsAssessmentResponseDto } from '@repo/types';

function iso(value: Date | null | undefined) {
  return value?.toISOString() ?? null;
}

export function mapTrainingNeedsAssessment(assessment: {
  id: string;
  employeeId: string;
  basedOnReviewId: string | null;
  periodYear: number;
  assessedById: string;
  developmentAreas: unknown;
  requestedTrainings: unknown;
  skillGapSummary: string | null;
  managerNotes: string | null;
  priority: string | null;
  status: string;
  submittedAt: Date | null;
  reviewedById: string | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}): TrainingNeedsAssessmentResponseDto {
  return {
    id: assessment.id,
    employeeId: assessment.employeeId,
    basedOnReviewId: assessment.basedOnReviewId,
    periodYear: assessment.periodYear,
    assessedById: assessment.assessedById,
    developmentAreas: Array.isArray(assessment.developmentAreas)
      ? (assessment.developmentAreas as TrainingNeedsAssessmentResponseDto['developmentAreas'])
      : [],
    requestedTrainings: Array.isArray(assessment.requestedTrainings)
      ? (assessment.requestedTrainings as TrainingNeedsAssessmentResponseDto['requestedTrainings'])
      : [],
    skillGapSummary: assessment.skillGapSummary,
    managerNotes: assessment.managerNotes,
    priority: assessment.priority,
    status: assessment.status as TrainingNeedsAssessmentResponseDto['status'],
    submittedAt: iso(assessment.submittedAt),
    reviewedById: assessment.reviewedById,
    reviewedAt: iso(assessment.reviewedAt),
    rejectionReason: assessment.rejectionReason,
    createdAt: assessment.createdAt.toISOString(),
    updatedAt: assessment.updatedAt.toISOString(),
  };
}
