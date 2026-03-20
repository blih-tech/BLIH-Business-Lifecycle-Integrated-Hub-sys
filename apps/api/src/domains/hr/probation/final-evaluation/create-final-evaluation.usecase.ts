import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  CreateFinalEvaluationDto,
  FinalEvaluationResponseDto,
  ProbationOutcomeValue,
} from './final-evaluation.dto';

// ─── Shared helpers ────────────────────────────────────────────────────────────

/** Standard Prisma include for FinalEvaluation queries. */
export const finalEvaluationInclude = {
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
} as const;

/** Compute the average score, rounded to 2 decimal places. */
function computeAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, s) => acc + s, 0);
  return Math.round((sum / scores.length) * 100) / 100;
}

/**
 * Map a ProbationOutcome to the corresponding ProbationStatus.
 * - CONFIRMED  → COMPLETED
 * - EXTENDED   → EXTENDED
 * - TERMINATED → FAILED
 * - RESIGNED   → CANCELLED
 */
function outcomeToStatus(outcome: ProbationOutcomeValue): string {
  const map: Record<ProbationOutcomeValue, string> = {
    CONFIRMED: 'COMPLETED',
    EXTENDED: 'EXTENDED',
    TERMINATED: 'FAILED',
    RESIGNED: 'CANCELLED',
  };
  return map[outcome];
}

/** Map a raw Prisma FinalEvaluation record to the response shape. */
export function mapFinalEvaluation(record: {
  id: string;
  probationId: string;
  outcome: string;
  comment: string | null;
  totalScore: number;
  createdAt: Date;
  scores: Array<{
    id: string;
    probationKpiId: string;
    score: number;
    comment: string | null;
    createdAt: Date;
    probationKpi: { kpi: { name: string } };
  }>;
}): FinalEvaluationResponseDto {
  return {
    id: record.id,
    probationId: record.probationId,
    outcome: record.outcome as ProbationOutcomeValue,
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
export class CreateFinalEvaluationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    dto: CreateFinalEvaluationDto,
  ): Promise<FinalEvaluationResponseDto> {
    // 1. Verify the probation plan exists with all its checkpoints and KPIs
    const plan = await this.prisma.probationPlan.findUnique({
      where: { id: dto.probationId },
      select: {
        id: true,
        kpis: { select: { id: true } },
        checkpoints: {
          select: {
            id: true,
            name: true,
            evaluations: { select: { id: true }, take: 1 },
          },
        },
        finalEvaluation: { select: { id: true } },
      },
    });

    if (!plan) {
      throw new NotFoundException(
        `Probation plan with id "${dto.probationId}" not found`,
      );
    }

    // 2. Guard: final evaluation already exists (1:1 relation, @unique on probationId)
    if (plan.finalEvaluation) {
      throw new ConflictException(
        `A final evaluation already exists for probation plan "${dto.probationId}". Use PATCH to update it.`,
      );
    }

    // 3. Guard: all checkpoints must have at least one evaluation
    const unevaluatedCheckpoints = plan.checkpoints.filter(
      (cp) => cp.evaluations.length === 0,
    );
    if (unevaluatedCheckpoints.length > 0) {
      const names = unevaluatedCheckpoints.map((cp) => `"${cp.name}"`).join(', ');
      throw new UnprocessableEntityException(
        `Cannot create final evaluation — the following checkpoints have not been evaluated yet: ${names}. ` +
          `Please complete all checkpoint evaluations before submitting the final evaluation.`,
      );
    }

    // 4. Validate that all submitted probationKpiIds belong to this plan
    const planKpiIds = new Set(plan.kpis.map((k) => k.id));
    const submittedKpiIds = dto.scores.map((s) => s.probationKpiId);
    const uniqueSubmitted = Array.from(new Set(submittedKpiIds));

    if (uniqueSubmitted.length !== submittedKpiIds.length) {
      throw new BadRequestException(
        'scores contains duplicate probationKpiId values',
      );
    }

    const foreignKpis = uniqueSubmitted.filter((id) => !planKpiIds.has(id));
    if (foreignKpis.length > 0) {
      throw new BadRequestException(
        `scores contains probationKpiId values that do not belong to this probation plan: ${foreignKpis.join(', ')}`,
      );
    }

    // 5. Compute totalScore server-side
    const totalScore = computeAverage(dto.scores.map((s) => s.score));

    // 6. Create final evaluation + scores, then update probation plan status — all in one transaction
    const evaluation = await this.prisma.$transaction(async (tx) => {
      const created = await tx.finalEvaluation.create({
        data: {
          probationId: dto.probationId,
          outcome: dto.outcome,
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
        include: finalEvaluationInclude,
      });

      // Update the probation plan status based on outcome
      await tx.probationPlan.update({
        where: { id: dto.probationId },
        data: { status: outcomeToStatus(dto.outcome) },
      });

      return created;
    });

    return mapFinalEvaluation(evaluation);
  }
}
