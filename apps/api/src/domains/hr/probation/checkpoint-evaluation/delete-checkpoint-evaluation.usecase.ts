import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

@Injectable()
export class DeleteCheckpointEvaluationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<{ success: true }> {
    const existing = await this.prisma.checkpointEvaluation.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(
        `Checkpoint evaluation with id "${id}" not found`,
      );
    }

    // EvaluationScores cascade via Prisma schema (onDelete: Cascade)
    await this.prisma.checkpointEvaluation.delete({ where: { id } });

    return { success: true };
  }
}
