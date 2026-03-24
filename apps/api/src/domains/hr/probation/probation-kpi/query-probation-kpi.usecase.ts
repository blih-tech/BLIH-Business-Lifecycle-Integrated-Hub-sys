import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { Prisma } from '../../../../platform/prisma/prisma-client';
import type { KpiListQueryDto } from './probation-kpi.dto';
import { mapKpi } from './create-probation-kpi.usecase';

@Injectable()
export class ListAllKpisUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: KpiListQueryDto) {
    const where = buildKpiWhereClause(query);
    const kpis = await this.prisma.kPI.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return kpis.map(mapKpi);
  }
}

@Injectable()
export class ListPaginatedKpisUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: KpiListQueryDto, requestId: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = buildKpiWhereClause(query);

    const [totalItems, items] = await Promise.all([
      this.prisma.kPI.count({ where }),
      this.prisma.kPI.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      success: true,
      message: 'KPIs retrieved successfully',
      data: items.map(mapKpi),
      error: null,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        version: 'v1',
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    };
  }
}

@Injectable()
export class GetKpiByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const kpi = await this.prisma.kPI.findUnique({
      where: { id },
    });

    if (!kpi) {
      throw new NotFoundException('KPI not found');
    }

    return mapKpi(kpi);
  }
}

function buildKpiWhereClause(query: KpiListQueryDto): Prisma.KPIWhereInput {
  const where: Prisma.KPIWhereInput = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  return where;
}
