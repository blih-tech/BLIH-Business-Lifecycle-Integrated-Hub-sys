import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { FinalEvaluationResponseDto } from './final-evaluation.dto';
import {
  finalEvaluationInclude,
  mapFinalEvaluation,
} from './create-final-evaluation.usecase';

@Injectable()
export class GetFinalEvaluationByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<FinalEvaluationResponseDto> {
    const evaluation = await this.prisma.finalEvaluation.findUnique({
      where: { id },
      include: finalEvaluationInclude,
    });

    if (!evaluation) {
      throw new NotFoundException(
        `Final evaluation with id "${id}" not found`,
      );
    }

    return mapFinalEvaluation(evaluation);
  }
}

@Injectable()
export class GetFinalEvaluationByProbationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(probationId: string): Promise<FinalEvaluationResponseDto> {
    // Ensure the probation plan exists for a meaningful 404
    const plan = await this.prisma.probationPlan.findUnique({
      where: { id: probationId },
      select: { id: true },
    });
    if (!plan) {
      throw new NotFoundException(
        `Probation plan with id "${probationId}" not found`,
      );
    }

    const evaluation = await this.prisma.finalEvaluation.findUnique({
      where: { probationId },
      include: finalEvaluationInclude,
    });

    if (!evaluation) {
      throw new NotFoundException(
        `No final evaluation found for probation plan "${probationId}"`,
      );
    }

    return mapFinalEvaluation(evaluation);
  }
}
