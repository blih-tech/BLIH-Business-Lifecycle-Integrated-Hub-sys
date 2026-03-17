import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import {
  buildSuccessEnvelope,
  type ResponseEnvelopeSuccessDto,
} from '../../../../shared/dto/response-envelope.dto';
import type {
  AssetProvisioningListQueryDto,
  AssetProvisioningResponseDto,
} from './asset-provisioning.dto';
import { mapAssetProvisioning } from './create-asset-provisioning.usecase';

function buildWhere(
  query: AssetProvisioningListQueryDto,
): Prisma.AssetProvisioningWhereInput {
  const where: Prisma.AssetProvisioningWhereInput = {};

  if (query.employeeId) {
    where.employeeId = query.employeeId;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.financeApprovalRequired !== undefined) {
    where.financeApprovalRequired = query.financeApprovalRequired;
  }

  return where;
}

@Injectable()
export class ListAllAssetProvisioningUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: AssetProvisioningListQueryDto,
  ): Promise<AssetProvisioningResponseDto[]> {
    const records = await this.prisma.assetProvisioning.findMany({
      where: buildWhere(query),
      orderBy: { createdAt: 'desc' },
    });

    return records.map(mapAssetProvisioning);
  }
}

@Injectable()
export class ListPaginatedAssetProvisioningUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: AssetProvisioningListQueryDto,
    requestId: string,
  ): Promise<ResponseEnvelopeSuccessDto<AssetProvisioningResponseDto[]>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = buildWhere(query);

    const [records, total] = await this.prisma.$transaction([
      this.prisma.assetProvisioning.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.assetProvisioning.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return buildSuccessEnvelope(
      records.map(mapAssetProvisioning),
      requestId,
      'Asset provisioning records retrieved successfully',
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
export class GetAssetProvisioningByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<AssetProvisioningResponseDto> {
    const record = await this.prisma.assetProvisioning.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(
        `Asset provisioning with id "${id}" not found`,
      );
    }

    return mapAssetProvisioning(record);
  }
}
