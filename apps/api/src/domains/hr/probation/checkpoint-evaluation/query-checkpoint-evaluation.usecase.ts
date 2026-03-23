import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { CheckpointEvaluationResponseDto } from './checkpoint-evaluation.dto';
import {
  checkpointEvaluationInclude,
  mapCheckpointEvaluation,
} from './create-checkpoint-evaluation.usecase';

@Injectable()
export class GetCheckpointEvaluationByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<CheckpointEvaluationResponseDto> {
    const evaluation = await this.prisma.checkpointEvaluation.findUnique({
      where: { id },
      include: checkpointEvaluationInclude,
    });

    if (!evaluation) {
      throw new NotFoundException(
        `Checkpoint evaluation with id "${id}" not found`,
      );
    }

    return mapCheckpointEvaluation(evaluation);
  }
}

@Injectable()
export class GetEvaluationByCheckpointUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    checkpointId: string,
  ): Promise<CheckpointEvaluationResponseDto> {
    // Verify the checkpoint exists first for a meaningful 404
    const checkpoint = await this.prisma.probationCheckpoint.findUnique({
      where: { id: checkpointId },
      select: { id: true },
    });
    if (!checkpoint) {
      throw new NotFoundException(
        `Checkpoint with id "${checkpointId}" not found`,
      );
    }

    const evaluation = await this.prisma.checkpointEvaluation.findFirst({
      where: { checkpointId },
      include: checkpointEvaluationInclude,
    });

    if (!evaluation) {
      throw new NotFoundException(
        `No evaluation found for checkpoint "${checkpointId}"`,
      );
    }

    return mapCheckpointEvaluation(evaluation);
  }
}

@Injectable()
export class ListEvaluationsByProbationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    probationId: string,
  ): Promise<CheckpointEvaluationResponseDto[]> {
    const plan = await this.prisma.probationPlan.findUnique({
      where: { id: probationId },
      select: { id: true },
    });
    if (!plan) {
      throw new NotFoundException(
        `Probation plan with id "${probationId}" not found`,
      );
    }

    const evaluations = await this.prisma.checkpointEvaluation.findMany({
      where: {
        checkpoint: { probationId },
      },
      include: checkpointEvaluationInclude,
      orderBy: { checkpoint: { checkpointDate: 'asc' } },
    });

    return evaluations.map(mapCheckpointEvaluation);
  }
}
