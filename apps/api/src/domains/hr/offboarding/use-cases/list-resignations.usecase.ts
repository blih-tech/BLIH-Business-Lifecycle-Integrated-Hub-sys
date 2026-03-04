import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapResignation } from '../offboarding.mapper';

@Injectable()
export class ListResignationsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { employeeId?: string; status?: string }) {
    const where: Record<string, string> = {};
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status) where.status = filters.status;
    const list = await this.prisma.resignation.findMany({
      where: where as never,
      orderBy: { createdAt: 'desc' },
    });
    return list.map(mapResignation);
  }
}
