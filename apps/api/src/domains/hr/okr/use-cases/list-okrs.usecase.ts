import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapOkrResponse } from '../okr.mapper';

@Injectable()
export class ListOkrsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: {
    userId?: string;
    scope?: string;
    departmentId?: string;
    periodYear?: number;
    periodQuarter?: number;
    status?: string;
  }) {
    const where: Record<string, unknown> = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.scope) where.scope = filters.scope;
    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.periodYear != null) where.periodYear = filters.periodYear;
    if (filters.periodQuarter != null)
      where.periodQuarter = filters.periodQuarter;
    if (filters.status) where.status = filters.status;

    const okrs = await this.prisma.okr.findMany({
      where,
      include: {
        department: { select: { name: true } },
        keyResults: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: [
        { periodYear: 'desc' },
        { periodQuarter: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    return okrs.map(mapOkrResponse);
  }
}
