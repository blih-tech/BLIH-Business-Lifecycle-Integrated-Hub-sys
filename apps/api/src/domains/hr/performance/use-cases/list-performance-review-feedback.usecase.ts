import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapPerformanceReviewFeedbackResponse } from '../performance.mapper';

@Injectable()
export class ListPerformanceReviewFeedbackUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(reviewId: string) {
    const review = await this.prisma.performanceReview.findUnique({
      where: { id: reviewId },
      select: { id: true },
    });
    if (!review) {
      throw new NotFoundException('Performance review not found');
    }

    const feedbacks = await this.prisma.performanceReviewFeedback.findMany({
      where: { reviewId },
      orderBy: [{ createdAt: 'asc' }],
    });

    return feedbacks.map(mapPerformanceReviewFeedbackResponse);
  }
}
