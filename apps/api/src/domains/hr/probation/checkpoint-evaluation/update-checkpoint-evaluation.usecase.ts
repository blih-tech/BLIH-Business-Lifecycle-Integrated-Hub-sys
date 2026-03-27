import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { CheckpointEvaluationResponseDto } from './checkpoint-evaluation.dto';
import {
  checkpointEvaluationInclude,
  mapCheckpointEvaluation,
} from './create-checkpoint-evaluation.usecase';

type UpdateScoreItem = {
  probationKpiId: string;
  score: number;
  comment?: string | null;
};

export interface UpdateCheckpointEvaluationInput {
  comment?: string | null;
  scores?: UpdateScoreItem[];
}

function computeAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, s) => acc + s, 0);
  return Math.round((sum / scores.length) * 100) / 100;
}

@Injectable()
export class UpdateCheckpointEvaluationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    dto: UpdateCheckpointEvaluationInput,
  ): Promise<CheckpointEvaluationResponseDto> {
    const existing = await this.prisma.checkpointEvaluation.findUnique({
      where: { id },
      select: {
        id: true,
        checkpointId: true,
        checkpoint: { select: { probationId: true } },
      },
    });
    if (!existing) {
      throw new NotFoundException(
        `Checkpoint evaluation with id "${id}" not found`,
      );
    }

    if (dto.scores !== undefined) {
      const kpiIds = dto.scores.map((s) => s.probationKpiId);
      const uniqueKpiIds = Array.from(new Set(kpiIds));
      if (uniqueKpiIds.length !== kpiIds.length) {
        throw new BadRequestException(
          'scores contains duplicate probationKpiId values',
        );
      }

      const planKpis = await this.prisma.probationKPI.findMany({
        where: {
          id: { in: uniqueKpiIds },
          probationId: existing.checkpoint.probationId,
        },
        select: { id: true },
      });

      if (planKpis.length !== uniqueKpiIds.length) {
        throw new BadRequestException(
          'One or more probationKpiId values do not belong to the probation plan for this checkpoint',
        );
      }
    }

    const evaluation = await this.prisma.$transaction(async (tx) => {
      if (dto.scores !== undefined) {
        const scores = dto.scores!;

        // Remove scores for KPIs no longer in the list
        await tx.evaluationScore.deleteMany({
          where: {
            checkpointEvaluationId: id,
            probationKpiId: {
              notIn: scores.map((s) => s.probationKpiId),
            },
          },
        });

        // Upsert each score
        await Promise.all(
          scores.map((s) =>
            tx.evaluationScore.upsert({
              where: {
                probationKpiId_checkpointEvaluationId: {
                  probationKpiId: s.probationKpiId,
                  checkpointEvaluationId: id,
                },
              },
              update: {
                score: s.score,
                ...(s.comment !== undefined && { comment: s.comment }),
              },
              create: {
                probationKpiId: s.probationKpiId,
                checkpointEvaluationId: id,
                score: s.score,
                comment: s.comment ?? null,
              },
            }),
          ),
        );
      }

      // Re-read all remaining scores to recompute totalScore
      const remainingScores = await tx.evaluationScore.findMany({
        where: { checkpointEvaluationId: id },
        select: { score: true },
      });
      const newTotalScore = computeAverage(remainingScores.map((s) => s.score));

      await tx.checkpointEvaluation.update({
        where: { id },
        data: {
          ...(dto.comment !== undefined && { comment: dto.comment }),
          totalScore: newTotalScore,
        },
      });

      return tx.checkpointEvaluation.findUnique({
        where: { id },
        include: checkpointEvaluationInclude,
      });
    });

    if (!evaluation) {
      throw new NotFoundException(
        `Checkpoint evaluation with id "${id}" not found`,
      );
    }

    return mapCheckpointEvaluation(evaluation);
  }
}
