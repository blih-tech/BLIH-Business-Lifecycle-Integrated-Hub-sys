import { Injectable } from '@nestjs/common';
import type { TrainingRequestStatus } from '../../../../platform/prisma/generated/enums';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapTrainingRequestResponse } from '../training.mapper';

@Injectable()
export class ListTrainingRequestsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { userId?: string; status?: string }) {
    const where: { userId?: string; status?: TrainingRequestStatus } = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status as TrainingRequestStatus;

    const requests = await this.prisma.trainingRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return requests.map(mapTrainingRequestResponse);
  }
}
