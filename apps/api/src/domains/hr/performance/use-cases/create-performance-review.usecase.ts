import { ConflictException, Injectable } from '@nestjs/common';
import type { CreatePerformanceReviewDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapPerformanceReviewResponse } from '../performance.mapper';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';

@Injectable()
export class CreatePerformanceReviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreatePerformanceReviewDto) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      dto.employeeId,
    );
    await this.prisma.reviewPeriodConfig.findUniqueOrThrow({
      where: { id: dto.periodConfigId },
    });

    const existing = await this.prisma.performanceReview.findUnique({
      where: {
        employeeId_periodConfigId: {
          employeeId: employee.id,
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
        employeeId: employee.id,
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
