import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import {
  calculateWeightedFinalRatingAndCategory,
  getRaiseRecommendation,
  isPromotionEligible,
} from '../performance-rating.utils';
import {
  getManagerRatingAverage,
  getRoleFeedbackAverage,
  getSelfRatingAverage,
} from '../review-rating-extract.utils';
import { mapPerformanceReviewResponse } from '../performance.mapper';

@Injectable()
export class CompletePerformanceReviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(reviewId: string) {
    const review = await this.prisma.performanceReview.findUnique({
      where: { id: reviewId },
      include: {
        feedbackEntries: true,
      },
    });
    if (!review) throw new NotFoundException('Performance review not found');
    if (review.status !== 'MANAGER_SUBMITTED') {
      throw new BadRequestException(
        'Review can only be completed when status is MANAGER_SUBMITTED',
      );
    }

    const selfAvg = getSelfRatingAverage(review.selfAssessment);
    const managerAvg = getManagerRatingAverage(review.managerReview);
    if (selfAvg == null || managerAvg == null) {
      throw new BadRequestException(
        'Both self assessment and manager review must contain rating data to complete',
      );
    }

    const peerAverage = getRoleFeedbackAverage(review.feedbackEntries, 'PEER');
    const directReportAverage = getRoleFeedbackAverage(
      review.feedbackEntries,
      'DIRECT_REPORT',
    );
    const skipLevelAverage = getRoleFeedbackAverage(
      review.feedbackEntries,
      'SKIP_LEVEL',
    );

    const { finalRating, category } = calculateWeightedFinalRatingAndCategory({
      selfAverage: selfAvg,
      managerAverage: managerAvg,
      peerAverage,
      directReportAverage,
      skipLevelAverage,
    });
    const raiseRecommendation = getRaiseRecommendation(category);
    const promotionEligible = isPromotionEligible(category);

    const updated = await this.prisma.performanceReview.update({
      where: { id: reviewId },
      data: {
        finalRating,
        category,
        raiseRecommendation: raiseRecommendation as never,
        promotionEligible,
        completedAt: new Date(),
        status: 'COMPLETED',
      },
      include: {
        feedbackEntries: {
          orderBy: [{ createdAt: 'asc' }],
        },
      },
    });
    return mapPerformanceReviewResponse(updated);
  }
}
