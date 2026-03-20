import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import {
  buildSuccessEnvelope,
  type ResponseEnvelopeSuccessDto,
} from '../../../shared/dto/response-envelope.dto';
import type {
  ProbationListQueryDto,
  ProbationResponseDto,
} from './probation.dto';
import { mapProbation, probationInclude } from './create-probation.usecase';

// ─── Shared filter builder ───────────────────────────────────────────────────

function buildWhere(
  query: ProbationListQueryDto,
): Prisma.ProbationPlanWhereInput {
  const where: Prisma.ProbationPlanWhereInput = {};

  if (query.employeeId) {
    where.employeeId = query.employeeId;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.startDateFrom || query.startDateTo) {
    where.startDate = {
      ...(query.startDateFrom && { gte: new Date(query.startDateFrom) }),
      ...(query.startDateTo && { lte: new Date(query.startDateTo) }),
    };
  }

  return where;
}

// ─── Use Cases ────────────────────────────────────────────────────────────────

@Injectable()
export class ListAllProbationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: ProbationListQueryDto,
  ): Promise<ProbationResponseDto[]> {
    const plans = await this.prisma.probationPlan.findMany({
      where: buildWhere(query),
      include: probationInclude,
      orderBy: { createdAt: 'desc' },
    });

    return plans.map(mapProbation);
  }
}

@Injectable()
export class ListPaginatedProbationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: ProbationListQueryDto,
    requestId: string,
  ): Promise<ResponseEnvelopeSuccessDto<ProbationResponseDto[]>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = buildWhere(query);

    const [plans, total] = await this.prisma.$transaction([
      this.prisma.probationPlan.findMany({
        where,
        include: probationInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.probationPlan.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return buildSuccessEnvelope(
      plans.map(mapProbation),
      requestId,
      'Probation plans retrieved successfully',
      {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    );
  }
}

@Injectable()
export class GetProbationByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<ProbationResponseDto> {
    const plan = await this.prisma.probationPlan.findUnique({
      where: { id },
      include: probationInclude,
    });

    if (!plan) {
      throw new NotFoundException(`Probation plan with id "${id}" not found`);
    }

    return mapProbation(plan);
  }
}
