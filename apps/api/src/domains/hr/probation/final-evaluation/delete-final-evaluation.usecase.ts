import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

@Injectable()
export class DeleteFinalEvaluationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<{ success: true }> {
    const existing = await this.prisma.finalEvaluation.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(
        `Final evaluation with id "${id}" not found`,
      );
    }

    // EvaluationScores cascade-delete via DB schema (onDelete: Cascade)
    await this.prisma.finalEvaluation.delete({ where: { id } });

    return { success: true };
  }
}
