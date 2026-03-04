import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateProbationEvaluationDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapProbationEvaluationResponse } from '../probation.mapper';
import {
  computeProbationAverageRating,
  expectedEvaluationRoundDates,
} from '../probation.utils';

@Injectable()
export class CreateProbationEvaluationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateProbationEvaluationDto) {
    const plan = await this.prisma.probationKpiPlan.findUnique({
      where: { id: dto.kpiPlanId },
      select: {
        id: true,
        employeeId: true,
        probationStart: true,
        probationEnd: true,
        status: true,
      },
    });
    if (!plan) throw new NotFoundException('Probation plan not found');
    if (plan.employeeId !== dto.employeeId) {
      throw new BadRequestException(
        'Evaluation employee must match probation plan employee',
      );
    }
    if (!['ACTIVE', 'DRAFT'].includes(plan.status)) {
      throw new BadRequestException(
        'Evaluations can only be created for open probation plans',
      );
    }

    const existing = await this.prisma.probationEvaluation.findFirst({
      where: {
        kpiPlanId: dto.kpiPlanId,
        evaluationRound: dto.evaluationRound,
      },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException(
        'An evaluation for this round already exists',
      );
    }

    const expectedDates = expectedEvaluationRoundDates(
      plan.probationStart,
      plan.probationEnd,
    );
    const evaluationDate = new Date(dto.evaluationDate);
    const expectedDate = expectedDates[dto.evaluationRound];
    const toleranceDays = Math.abs(
      Math.ceil(
        (evaluationDate.getTime() - expectedDate.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );
    if (toleranceDays > 14) {
      throw new BadRequestException(
        `Evaluation date is too far from expected ${dto.evaluationRound} milestone`,
      );
    }

    const averageRating =
      dto.averageRating ??
      computeProbationAverageRating(dto.goalReviews, dto.conduct);

    const created = await this.prisma.probationEvaluation.create({
      data: {
        kpiPlanId: dto.kpiPlanId,
        employeeId: dto.employeeId,
        evaluationRound: dto.evaluationRound,
        evaluationDate,
        goalReviews: (dto.goalReviews ?? undefined) as never,
        conduct: (dto.conduct ?? undefined) as never,
        averageRating: averageRating ?? undefined,
        supervisorRecommendation: dto.supervisorRecommendation ?? undefined,
        hrRemarks: dto.hrRemarks ?? undefined,
        hrVerdict: dto.hrVerdict ?? undefined,
      },
    });

    return mapProbationEvaluationResponse(created);
  }
}
