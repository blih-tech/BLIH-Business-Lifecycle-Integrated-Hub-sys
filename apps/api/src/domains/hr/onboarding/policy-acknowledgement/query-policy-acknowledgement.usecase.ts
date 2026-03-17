import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import {
  buildSuccessEnvelope,
  type ResponseEnvelopeSuccessDto,
} from '../../../../shared/dto/response-envelope.dto';
import type {
  PolicyAcknowledgementListQueryDto,
  PolicyAcknowledgementResponseDto,
} from './policy-acknowledgement.dto';
import { mapPolicyAcknowledgement } from './create-policy-acknowledgement.usecase';

function buildWhere(
  query: PolicyAcknowledgementListQueryDto,
): Prisma.PolicyAcknowledgementWhereInput {
  const where: Prisma.PolicyAcknowledgementWhereInput = {};

  if (query.employeeId) {
    where.employeeId = query.employeeId;
  }

  if (query.verifiedById) {
    where.verifiedById = query.verifiedById;
  }

  if (query.allAcknowledged !== undefined) {
    where.allAcknowledged = query.allAcknowledged;
  }

  return where;
}

@Injectable()
export class ListAllPolicyAcknowledgementUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: PolicyAcknowledgementListQueryDto,
  ): Promise<PolicyAcknowledgementResponseDto[]> {
    const records = await this.prisma.policyAcknowledgement.findMany({
      where: buildWhere(query),
      orderBy: { createdAt: 'desc' },
    });

    return records.map(mapPolicyAcknowledgement);
  }
}

@Injectable()
export class ListPaginatedPolicyAcknowledgementUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: PolicyAcknowledgementListQueryDto,
    requestId: string,
  ): Promise<ResponseEnvelopeSuccessDto<PolicyAcknowledgementResponseDto[]>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = buildWhere(query);

    const [records, total] = await this.prisma.$transaction([
      this.prisma.policyAcknowledgement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.policyAcknowledgement.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return buildSuccessEnvelope(
      records.map(mapPolicyAcknowledgement),
      requestId,
      'Policy acknowledgement records retrieved successfully',
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
export class GetPolicyAcknowledgementByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<PolicyAcknowledgementResponseDto> {
    const record = await this.prisma.policyAcknowledgement.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(
        `Policy acknowledgement with id "${id}" not found`,
      );
    }

    return mapPolicyAcknowledgement(record);
  }
}
