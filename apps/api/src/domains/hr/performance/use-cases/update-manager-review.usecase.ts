import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { UpdateManagerReviewDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapPerformanceReviewResponse } from '../performance.mapper';

@Injectable()
export class UpdateManagerReviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(reviewId: string, dto: UpdateManagerReviewDto) {
    const review = await this.prisma.performanceReview.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Performance review not found');
    if (
      review.status !== 'SELF_SUBMITTED' &&
      review.status !== 'MANAGER_PENDING'
    ) {
      throw new BadRequestException(
        'Manager review can only be updated when status is SELF_SUBMITTED or MANAGER_PENDING',
      );
    }
    const managerReview = {
      ...(typeof review.managerReview === 'object' &&
      review.managerReview != null
        ? (review.managerReview as Record<string, unknown>)
        : {}),
      ...dto,
    };
    const updated = await this.prisma.performanceReview.update({
      where: { id: reviewId },
      data: {
        managerReview: managerReview as never,
        status: 'MANAGER_SUBMITTED',
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
