import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapProbationPlanResponse } from '../probation.mapper';

@Injectable()
export class GetProbationPlanUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const plan = await this.prisma.probationKpiPlan.findUnique({
      where: { id },
    });
    if (!plan) throw new NotFoundException('Probation plan not found');
    return mapProbationPlanResponse(plan);
  }
}
