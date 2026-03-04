import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateSuccessionPlanDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapSuccessionPlan } from '../talent.mapper';

@Injectable()
export class UpdateSuccessionPlanUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateSuccessionPlanDto) {
    const existing = await this.prisma.successionPlan.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Succession plan not found');
    }

    const plan = await this.prisma.successionPlan.update({
      where: { id },
      data: {
        ...(dto.readiness !== undefined ? { readiness: dto.readiness } : {}),
        ...(dto.riskLevel !== undefined ? { riskLevel: dto.riskLevel } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
    });
    return mapSuccessionPlan(plan);
  }
}
