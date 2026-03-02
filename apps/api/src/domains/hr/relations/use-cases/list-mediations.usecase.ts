import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapConflictMediation } from '../relations.mapper';

@Injectable()
export class ListMediationsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: {
    requesterId?: string;
    mediatorId?: string;
    status?: string;
  }) {
    const where: Record<string, string> = {};
    if (filters.requesterId) where.requesterId = filters.requesterId;
    if (filters.mediatorId) where.mediatorId = filters.mediatorId;
    if (filters.status) where.status = filters.status;
    const list = await this.prisma.conflictMediation.findMany({
      where: where as never,
      orderBy: { createdAt: 'desc' },
    });
    return list.map(mapConflictMediation);
  }
}
