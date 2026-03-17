import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { AnnualPerformanceSummaryDto } from '@repo/types';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';

@Injectable()
export class GetAnnualSummaryUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    employeeId: string,
    year: number,
  ): Promise<AnnualPerformanceSummaryDto> {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      employeeId,
    );
    const periods = await this.prisma.reviewPeriodConfig.findMany({
      where: { year },
      select: { id: true },
    });
    const periodIds = periods.map((p) => p.id);

    const reviews = await this.prisma.performanceReview.findMany({
      where: {
        employeeId: employee.id,
        periodConfigId: { in: periodIds },
        status: 'COMPLETED',
      },
      select: {
        finalRating: true,
        category: true,
        raiseRecommendation: true,
        promotionEligible: true,
      },
    });

    let averageRating: number | null = null;
    let latestCategory: AnnualPerformanceSummaryDto['latestCategory'] = null;
    let raiseRecommendation: AnnualPerformanceSummaryDto['raiseRecommendation'] =
      null;
    let promotionEligible = false;

    if (reviews.length > 0) {
      const ratings = reviews
        .map((r) => (r.finalRating != null ? Number(r.finalRating) : null))
        .filter((r): r is number => r !== null);
      averageRating =
        ratings.length > 0
          ? Math.round(
              (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10,
            ) / 10
          : null;
      const last = reviews[reviews.length - 1];
      latestCategory =
        last.category as AnnualPerformanceSummaryDto['latestCategory'];
      promotionEligible = last.promotionEligible;
      const rr = last.raiseRecommendation;
      if (
        rr &&
        typeof rr === 'object' &&
        'minPercent' in rr &&
        'maxPercent' in rr
      ) {
        raiseRecommendation = {
          minPercent: Number((rr as { minPercent: unknown }).minPercent),
          maxPercent: Number((rr as { maxPercent: unknown }).maxPercent),
        };
      }
    }

    const okrs = await this.prisma.okr.findMany({
      where: { employeeId: employee.id, periodYear: year, scope: 'USER' },
      select: { overallProgress: true },
    });
    const okrCompletionPercent =
      okrs.length > 0
        ? Math.round(
            okrs.reduce((sum, o) => sum + o.overallProgress, 0) / okrs.length,
          )
        : null;

    return {
      employeeId: employee.id,
      year,
      completedReviews: reviews.length,
      averageRating,
      latestCategory,
      raiseRecommendation,
      promotionEligible,
      okrCompletionPercent,
    };
  }
}
