import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  CheckpointEvaluationResponseDto,
  CreateCheckpointEvaluationDto,
} from './checkpoint-evaluation.dto';

// ─── Shared helpers ────────────────────────────────────────────────────────────

/** Standard Prisma include for CheckpointEvaluation queries. */
export const checkpointEvaluationInclude = {
  scores: {
    select: {
      id: true,
      probationKpiId: true,
      score: true,
      comment: true,
      createdAt: true,
      probationKpi: {
        select: { kpi: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
  checkpoint: {
    select: { id: true, name: true },
  },
} as const;

/** Compute the average score from a list of raw score values. */
function computeAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, s) => acc + s, 0);
  return Math.round((sum / scores.length) * 100) / 100; // round to 2 decimal places
}

/** Map a raw Prisma CheckpointEvaluation record to the response shape. */
export function mapCheckpointEvaluation(record: {
  id: string;
  checkpointId: string;
  comment: string | null;
  totalScore: number;
  createdAt: Date;
  checkpoint: { id: string; name: string };
  scores: Array<{
    id: string;
    probationKpiId: string;
    score: number;
    comment: string | null;
    createdAt: Date;
    probationKpi: { kpi: { name: string } };
  }>;
}): CheckpointEvaluationResponseDto {
  return {
    id: record.id,
    checkpointId: record.checkpointId,
    checkpointName: record.checkpoint.name,
    comment: record.comment,
    totalScore: record.totalScore,
    scores: record.scores.map((s) => ({
      id: s.id,
      probationKpiId: s.probationKpiId,
      kpiName: s.probationKpi.kpi.name,
      score: s.score,
      comment: s.comment,
      createdAt: s.createdAt.toISOString(),
    })),
    createdAt: record.createdAt.toISOString(),
  };
}

// ─── Use Case ─────────────────────────────────────────────────────────────────

@Injectable()
export class CreateCheckpointEvaluationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    dto: CreateCheckpointEvaluationDto,
  ): Promise<CheckpointEvaluationResponseDto> {
    // 1. Verify the checkpoint exists and load its probation plan
    const checkpoint = await this.prisma.probationCheckpoint.findUnique({
      where: { id: dto.checkpointId },
      select: { id: true, probationId: true },
    });
    if (!checkpoint) {
      throw new NotFoundException(
        `Checkpoint with id "${dto.checkpointId}" not found`,
      );
    }

    // 2. Guard against duplicate evaluation for this checkpoint
    const existingEvaluation =
      await this.prisma.checkpointEvaluation.findFirst({
        where: { checkpointId: dto.checkpointId },
        select: { id: true },
      });
    if (existingEvaluation) {
      throw new ConflictException(
        `A checkpoint evaluation already exists for checkpoint "${dto.checkpointId}". ` +
          `Use PATCH to update it.`,
      );
    }

    // 3. Verify all probationKpiIds belong to the same probation plan
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
        probationId: checkpoint.probationId,
      },
      select: { id: true },
    });

    if (planKpis.length !== uniqueKpiIds.length) {
      throw new BadRequestException(
        'One or more probationKpiId values do not belong to the probation plan for this checkpoint',
      );
    }

    // 4. Compute totalScore server-side
    const totalScore = computeAverage(dto.scores.map((s) => s.score));

    // 5. Create evaluation + scores in one DB call
    const evaluation = await this.prisma.checkpointEvaluation.create({
      data: {
        checkpointId: dto.checkpointId,
        comment: dto.comment ?? null,
        totalScore,
        scores: {
          create: dto.scores.map((s) => ({
            probationKpiId: s.probationKpiId,
            score: s.score,
            comment: s.comment ?? null,
          })),
        },
      },
      include: checkpointEvaluationInclude,
    });

    return mapCheckpointEvaluation(evaluation);
  }
}
