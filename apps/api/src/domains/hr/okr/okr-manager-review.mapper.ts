import type { OkrManagerReviewResponseDto } from '@repo/types';

export function mapOkrManagerReview(review: {
  id: string;
  okrId: string;
  reviewerId: string;
  decision: string;
  overallConfidence: number | null;
  comments: string | null;
  strengths: unknown;
  risks: unknown;
  supportActions: unknown;
  reviewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}): OkrManagerReviewResponseDto {
  return {
    id: review.id,
    okrId: review.okrId,
    reviewerId: review.reviewerId,
    decision: review.decision as OkrManagerReviewResponseDto['decision'],
    overallConfidence: review.overallConfidence,
    comments: review.comments,
    strengths: Array.isArray(review.strengths)
      ? (review.strengths as string[])
      : null,
    risks: Array.isArray(review.risks) ? (review.risks as string[]) : null,
    supportActions: Array.isArray(review.supportActions)
      ? (review.supportActions as string[])
      : null,
    reviewedAt: review.reviewedAt.toISOString(),
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}
