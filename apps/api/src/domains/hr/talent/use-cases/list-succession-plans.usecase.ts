import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapSuccessionPlan } from '../talent.mapper';

@Injectable()
export class ListSuccessionPlansUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: {
    positionId?: string;
    candidateEmployeeId?: string;
  }) {
    const plans = await this.prisma.successionPlan.findMany({
      where: {
        ...(filters.positionId ? { positionId: filters.positionId } : {}),
        ...(filters.candidateEmployeeId
          ? { candidateEmployeeId: filters.candidateEmployeeId }
          : {}),
      },
      orderBy: [{ updatedAt: 'desc' }],
    });
    return plans.map(mapSuccessionPlan);
  }
}
