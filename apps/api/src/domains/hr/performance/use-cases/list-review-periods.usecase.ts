import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapReviewPeriodConfigResponse } from '../performance.mapper';

@Injectable()
export class ListReviewPeriodsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { year?: number }) {
    const where: { year?: number } = {};
    if (filters.year != null) where.year = filters.year;

    const configs = await this.prisma.reviewPeriodConfig.findMany({
      where,
      orderBy: [{ year: 'asc' }, { quarter: 'asc' }],
    });
    return configs.map(mapReviewPeriodConfigResponse);
  }
}
