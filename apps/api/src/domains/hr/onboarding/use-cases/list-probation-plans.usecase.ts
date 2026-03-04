import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapProbationPlanResponse } from '../probation.mapper';

@Injectable()
export class ListProbationPlansUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: {
    employeeId?: string;
    supervisorId?: string;
    status?: string;
  }) {
    const list = await this.prisma.probationKpiPlan.findMany({
      where: {
        ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
        ...(filters.supervisorId ? { supervisorId: filters.supervisorId } : {}),
        ...(filters.status ? { status: filters.status as never } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return list.map(mapProbationPlanResponse);
  }
}
