import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapResignation } from '../offboarding.mapper';

@Injectable()
export class ListResignationsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { userId?: string; status?: string }) {
    const where: Record<string, string> = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status;
    const list = await this.prisma.resignation.findMany({
      where: where as never,
      orderBy: { createdAt: 'desc' },
    });
    return list.map(mapResignation);
  }
}
