import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapProbationEvaluationResponse } from '../probation.mapper';

@Injectable()
export class ListProbationEvaluationsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: {
    employeeId?: string;
    kpiPlanId?: string;
    round?: string;
  }) {
    const list = await this.prisma.probationEvaluation.findMany({
      where: {
        ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
        ...(filters.kpiPlanId ? { probationPlanId: filters.kpiPlanId } : {}),
        ...(filters.round ? { round: filters.round as never } : {}),
      },
      orderBy: [{ evaluationDate: 'asc' }, { createdAt: 'asc' }],
    });

    return list.map(mapProbationEvaluationResponse);
  }
}
