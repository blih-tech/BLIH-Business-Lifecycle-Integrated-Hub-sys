import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreateProbationConfirmationDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';
import { mapProbationConfirmationResponse } from '../probation.mapper';

@Injectable()
export class CreateProbationConfirmationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateProbationConfirmationDto) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      dto.employeeId,
    );

    const latestFinalEvaluation =
      await this.prisma.probationEvaluation.findFirst({
        where: {
          employeeId: employee.id,
          round: 'DAY_60_FINAL',
        },
        orderBy: { createdAt: 'desc' },
      });

    if (!latestFinalEvaluation && !dto.reviewSummary) {
      throw new BadRequestException(
        'Probation confirmation requires a final evaluation or review summary',
      );
    }

    const reviewSummary =
      dto.reviewSummary ??
      ({
        latestEvaluationId: latestFinalEvaluation?.id ?? null,
        finalDecision: latestFinalEvaluation?.recommendation ?? null,
        averageRating: latestFinalEvaluation?.overallScore?.toString() ?? null,
      } as Record<string, unknown>);

    const created = await this.prisma.probationConfirmation.create({
      data: {
        employeeId: employee.id,
        reviewSummary: reviewSummary as never,
        verdict: dto.verdict,
        extension: (dto.extension ?? undefined) as never,
        termination: (dto.termination ?? undefined) as never,
        confirmation: (dto.confirmation ?? undefined) as never,
      },
    });

    return mapProbationConfirmationResponse(created);
  }
}
