import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { UpsertPerformanceReviewFeedbackDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapPerformanceReviewFeedbackResponse } from '../performance.mapper';

@Injectable()
export class UpsertPerformanceReviewFeedbackUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(reviewId: string, dto: UpsertPerformanceReviewFeedbackDto) {
    const review = await this.prisma.performanceReview.findUnique({
      where: { id: reviewId },
      select: { id: true, userId: true },
    });
    if (!review) {
      throw new NotFoundException('Performance review not found');
    }

    const reviewer = await this.prisma.user.findUnique({
      where: { id: dto.reviewerId },
      select: { id: true },
    });
    if (!reviewer) {
      throw new NotFoundException('Reviewer not found');
    }

    if (dto.role === 'SELF' && dto.reviewerId !== review.userId) {
      throw new BadRequestException(
        'SELF feedback reviewer must match the review user',
      );
    }

    const feedback = await this.prisma.performanceReviewFeedback.upsert({
      where: {
        reviewId_reviewerId_role: {
          reviewId,
          reviewerId: dto.reviewerId,
          role: dto.role,
        },
      },
      update: {
        ratings: (dto.ratings ?? null) as never,
        comments: (dto.comments ?? null) as never,
        submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : new Date(),
      },
      create: {
        reviewId,
        reviewerId: dto.reviewerId,
        role: dto.role,
        ratings: (dto.ratings ?? null) as never,
        comments: (dto.comments ?? null) as never,
        submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : new Date(),
      },
    });

    return mapPerformanceReviewFeedbackResponse(feedback);
  }
}
