import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { ReviewStatus } from '../../../../platform/prisma/generated/enums';
import { mapPerformanceReviewResponse } from '../performance.mapper';

export interface ListPerformanceReviewsFilters {
  userId?: string;
  periodConfigId?: string;
  status?: string;
}

@Injectable()
export class ListPerformanceReviewsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: ListPerformanceReviewsFilters) {
    const where: {
      userId?: string;
      periodConfigId?: string;
      status?: ReviewStatus;
    } = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.periodConfigId) where.periodConfigId = filters.periodConfigId;
    if (filters.status) where.status = filters.status as ReviewStatus;

    const reviews = await this.prisma.performanceReview.findMany({
      where,
      include: {
        feedbackEntries: {
          orderBy: [{ createdAt: 'asc' }],
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return reviews.map(mapPerformanceReviewResponse);
  }
}
