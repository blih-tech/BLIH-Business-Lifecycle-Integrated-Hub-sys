import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapLeaveRequestResponse } from '../leave-request.mapper';

@Injectable()
export class ListLeaveRequestsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { userId?: string; status?: string }) {
    const where: Record<string, unknown> = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status;

    const list = await this.prisma.leaveRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return list.map(mapLeaveRequestResponse);
  }
}
