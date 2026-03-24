import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  FinalEvaluationResponseDto,
  ProbationOutcomeValue,
} from './final-evaluation.dto';
import { ProbationStatus } from '../../../../platform/prisma/prisma-client';
import {
  finalEvaluationInclude,
  mapFinalEvaluation,
} from './create-final-evaluation.usecase';

type UpdateScoreItem = {
  probationKpiId: string;
  score: number;
  comment?: string | null;
};

export interface UpdateFinalEvaluationInput {
  outcome?: ProbationOutcomeValue;
  comment?: string | null;
  scores?: UpdateScoreItem[];
}

function computeAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, s) => acc + s, 0);
  return Math.round((sum / scores.length) * 100) / 100;
}

function outcomeToStatus(outcome: ProbationOutcomeValue): ProbationStatus {
  const map: Record<ProbationOutcomeValue, ProbationStatus> = {
    CONFIRMED: ProbationStatus.COMPLETED,
    EXTENDED: ProbationStatus.EXTENDED,
    TERMINATED: ProbationStatus.FAILED,
    RESIGNED: ProbationStatus.CANCELLED,
  };
  return map[outcome];
}

@Injectable()
export class UpdateFinalEvaluationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    dto: UpdateFinalEvaluationInput,
  ): Promise<FinalEvaluationResponseDto> {
    const existing = await this.prisma.finalEvaluation.findUnique({
      where: { id },
      select: {
        id: true,
        probationId: true,
        probation: { select: { kpis: { select: { id: true } } } },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Final evaluation with id "${id}" not found`);
    }

    if (dto.scores !== undefined) {
      const kpiIds = dto.scores.map((s) => s.probationKpiId);
      const uniqueKpiIds = Array.from(new Set(kpiIds));
      if (uniqueKpiIds.length !== kpiIds.length) {
        throw new BadRequestException(
          'scores contains duplicate probationKpiId values',
        );
      }

      const planKpiIds = new Set(existing.probation.kpis.map((k) => k.id));
      const foreignKpis = uniqueKpiIds.filter((kId) => !planKpiIds.has(kId));
      if (foreignKpis.length > 0) {
        throw new BadRequestException(
          `scores contains probationKpiId values that do not belong to this probation plan: ${foreignKpis.join(', ')}`,
        );
      }
    }

    const evaluation = await this.prisma.$transaction(async (tx) => {
      if (dto.scores !== undefined) {
        // Replace-all strategy: delete all existing scores, recreate from the new list.
        // This avoids the nullable compound-unique-key constraint issue with EvaluationScore.
        await tx.evaluationScore.deleteMany({
          where: { finalEvaluationId: id },
        });

        if (dto.scores.length > 0) {
          await tx.evaluationScore.createMany({
            data: dto.scores.map((s) => ({
              finalEvaluationId: id,
              probationKpiId: s.probationKpiId,
              score: s.score,
              comment: s.comment ?? null,
            })),
          });
        }
      }

      // Recompute totalScore from the current (new) scores
      const currentScores = await tx.evaluationScore.findMany({
        where: { finalEvaluationId: id },
        select: { score: true },
      });
      const newTotalScore = computeAverage(currentScores.map((s) => s.score));

      const updatedEvaluation = await tx.finalEvaluation.update({
        where: { id },
        data: {
          ...(dto.comment !== undefined && { comment: dto.comment }),
          ...(dto.outcome !== undefined && { outcome: dto.outcome }),
          totalScore: newTotalScore,
        },
        include: finalEvaluationInclude,
      });

      // If outcome changed, re-sync the probation plan status
      if (dto.outcome !== undefined) {
        await tx.probationPlan.update({
          where: { id: existing.probationId },
          data: { status: outcomeToStatus(dto.outcome) },
        });
      }

      return updatedEvaluation;
    });

    return mapFinalEvaluation(evaluation);
  }
}
