import { ConflictException, Injectable } from '@nestjs/common';
import type { CreatePerformanceReviewDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapPerformanceReviewResponse } from '../performance.mapper';

@Injectable()
export class CreatePerformanceReviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreatePerformanceReviewDto) {
    await this.prisma.user.findUniqueOrThrow({ where: { id: dto.userId } });
    await this.prisma.reviewPeriodConfig.findUniqueOrThrow({
      where: { id: dto.periodConfigId },
    });

    const existing = await this.prisma.performanceReview.findUnique({
      where: {
        userId_periodConfigId: {
          userId: dto.userId,
          periodConfigId: dto.periodConfigId,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        'Performance review already exists for this user and period',
      );
    }

    const review = await this.prisma.performanceReview.create({
      data: {
        userId: dto.userId,
        periodConfigId: dto.periodConfigId,
        status: 'NOT_STARTED',
      },
      include: {
        feedbackEntries: {
          orderBy: [{ createdAt: 'asc' }],
        },
      },
    });
    return mapPerformanceReviewResponse(review);
  }
}
