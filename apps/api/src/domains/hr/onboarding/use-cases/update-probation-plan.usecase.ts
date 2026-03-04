import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateProbationKpiPlanDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapProbationPlanResponse } from '../probation.mapper';
import { validateProbationGoals } from '../probation.utils';

@Injectable()
export class UpdateProbationPlanUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateProbationKpiPlanDto) {
    const existing = await this.prisma.probationKpiPlan.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Probation plan not found');
    if (dto.goals !== undefined) validateProbationGoals(dto.goals);

    const updated = await this.prisma.probationKpiPlan.update({
      where: { id },
      data: {
        goals: dto.goals === undefined ? undefined : (dto.goals as never),
        development:
          dto.development === undefined
            ? undefined
            : (dto.development as never),
        employeeEndorsedAt:
          dto.employeeEndorsedAt === undefined
            ? undefined
            : dto.employeeEndorsedAt
              ? new Date(dto.employeeEndorsedAt)
              : null,
        supervisorEndorsedAt:
          dto.supervisorEndorsedAt === undefined
            ? undefined
            : dto.supervisorEndorsedAt
              ? new Date(dto.supervisorEndorsedAt)
              : null,
        hrEndorsedAt:
          dto.hrEndorsedAt === undefined
            ? undefined
            : dto.hrEndorsedAt
              ? new Date(dto.hrEndorsedAt)
              : null,
        status: dto.status ?? undefined,
      },
    });

    return mapProbationPlanResponse(updated);
  }
}
