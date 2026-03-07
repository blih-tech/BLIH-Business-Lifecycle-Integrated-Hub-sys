import { Injectable } from '@nestjs/common';
import type { TrainingRequestStatus } from '../../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapTrainingRequestResponse } from '../training.mapper';

@Injectable()
export class ListTrainingRequestsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { employeeId?: string; status?: string }) {
    const where: { employeeId?: string; status?: TrainingRequestStatus } = {};
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status) where.status = filters.status as TrainingRequestStatus;

    const requests = await this.prisma.trainingRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return requests.map(mapTrainingRequestResponse);
  }
}
