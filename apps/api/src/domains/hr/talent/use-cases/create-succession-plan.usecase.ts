import { ConflictException, Injectable } from '@nestjs/common';
import type { CreateSuccessionPlanDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapSuccessionPlan } from '../talent.mapper';

@Injectable()
export class CreateSuccessionPlanUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateSuccessionPlanDto) {
    await this.prisma.position.findUniqueOrThrow({
      where: { id: dto.positionId },
    });
    await this.prisma.user.findUniqueOrThrow({
      where: { id: dto.candidateId },
    });

    try {
      const plan = await this.prisma.successionPlan.create({
        data: {
          positionId: dto.positionId,
          candidateId: dto.candidateId,
          readiness: dto.readiness,
          riskLevel: dto.riskLevel,
          notes: dto.notes ?? null,
        },
      });
      return mapSuccessionPlan(plan);
    } catch {
      throw new ConflictException(
        'Succession plan already exists for this candidate and position',
      );
    }
  }
}
