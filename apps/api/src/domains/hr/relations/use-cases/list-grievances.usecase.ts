import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapGrievance } from '../relations.mapper';

@Injectable()
export class ListGrievancesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { userId?: string; assignedToId?: string }) {
    const where: { userId?: string; assignedToId?: string } = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.assignedToId) where.assignedToId = filters.assignedToId;
    const list = await this.prisma.grievance.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
    });
    return list.map(mapGrievance);
  }
}
