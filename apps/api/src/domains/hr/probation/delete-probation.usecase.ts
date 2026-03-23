import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class DeleteProbationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<{ success: true }> {
    const existing = await this.prisma.probationPlan.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Probation plan with id "${id}" not found`);
    }

    // Cascade deletes are handled at the DB level (onDelete: Cascade)
    await this.prisma.probationPlan.delete({ where: { id } });

    return { success: true };
  }
}
