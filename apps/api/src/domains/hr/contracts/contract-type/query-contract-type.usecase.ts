import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  ContractTypeListQueryDto,
  ContractTypeResponseDto,
} from './contract-type.dto';
import { mapContractType } from './create-contract-type.usecase';
import { Prisma } from '../../../../platform/prisma/prisma-client';
import type { PaginatedResult } from '@repo/types';

@Injectable()
export class ListAllContractTypesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<ContractTypeResponseDto[]> {
    const records = await this.prisma.contractType.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapContractType);
  }
}

@Injectable()
export class ListPaginatedContractTypesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: ContractTypeListQueryDto,
  ): Promise<PaginatedResult<ContractTypeResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.ContractTypeWhereInput = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, records] = await Promise.all([
      this.prisma.contractType.count({ where }),
      this.prisma.contractType.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      items: records.map(mapContractType),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }
}

@Injectable()
export class GetContractTypeByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<ContractTypeResponseDto> {
    const record = await this.prisma.contractType.findUnique({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException('Contract type not found');
    }
    return mapContractType(record);
  }
}
