import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapPerformanceReviewResponse } from '../performance.mapper';

@Injectable()
export class GetPerformanceReviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const review = await this.prisma.performanceReview.findUnique({
      where: { id },
      include: {
        feedbackEntries: {
          orderBy: [{ createdAt: 'asc' }],
        },
      },
    });
    if (!review) throw new NotFoundException('Performance review not found');
    return mapPerformanceReviewResponse(review);
  }
}
