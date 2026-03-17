import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { UpdateSelfAssessmentDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapPerformanceReviewResponse } from '../performance.mapper';

@Injectable()
export class UpdateSelfAssessmentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(reviewId: string, dto: UpdateSelfAssessmentDto) {
    const review = await this.prisma.performanceReview.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Performance review not found');
    if (review.status !== 'NOT_STARTED' && review.status !== 'SELF_PENDING') {
      throw new BadRequestException(
        'Self assessment can only be updated when status is NOT_STARTED or SELF_PENDING',
      );
    }
    const selfAssessment = {
      ...(typeof review.selfAssessment === 'object' &&
      review.selfAssessment != null
        ? (review.selfAssessment as Record<string, unknown>)
        : {}),
      ...dto,
    };
    const updated = await this.prisma.performanceReview.update({
      where: { id: reviewId },
      data: {
        selfAssessment: selfAssessment as never,
        status: 'SELF_SUBMITTED',
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
