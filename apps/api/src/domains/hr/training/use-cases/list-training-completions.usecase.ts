import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapTrainingCompletionResponse } from '../training.mapper';

@Injectable()
export class ListTrainingCompletionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { employeeId?: string }) {
    const where = filters.employeeId ? { employeeId: filters.employeeId } : {};
    const list = await this.prisma.trainingCompletion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return list.map(mapTrainingCompletionResponse);
  }
}
