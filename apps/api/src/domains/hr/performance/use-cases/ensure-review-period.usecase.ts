import { Injectable } from '@nestjs/common';
import type { CreateReviewPeriodConfigDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { getReviewWindowForQuarter } from '../review-period.utils';
import { mapReviewPeriodConfigResponse } from '../performance.mapper';

@Injectable()
export class EnsureReviewPeriodUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateReviewPeriodConfigDto) {
    const existing = await this.prisma.reviewPeriodConfig.findUnique({
      where: { year_quarter: { year: dto.year, quarter: dto.quarter } },
    });
    if (existing) return mapReviewPeriodConfigResponse(existing);

    const window =
      dto.windowOpensAt &&
      dto.selfAssessmentDueAt &&
      dto.managerReviewDueAt &&
      dto.windowClosesAt
        ? {
            windowOpensAt: new Date(dto.windowOpensAt),
            selfAssessmentDueAt: new Date(dto.selfAssessmentDueAt),
            managerReviewDueAt: new Date(dto.managerReviewDueAt),
            windowClosesAt: new Date(dto.windowClosesAt),
          }
        : getReviewWindowForQuarter(dto.year, dto.quarter);

    const created = await this.prisma.reviewPeriodConfig.create({
      data: {
        year: dto.year,
        quarter: dto.quarter,
        type: (dto.type as never) ?? 'QUARTERLY',
        windowOpensAt: window.windowOpensAt,
        selfAssessmentDueAt: window.selfAssessmentDueAt,
        managerReviewDueAt: window.managerReviewDueAt,
        windowClosesAt: window.windowClosesAt,
      },
    });
    return mapReviewPeriodConfigResponse(created);
  }
}
