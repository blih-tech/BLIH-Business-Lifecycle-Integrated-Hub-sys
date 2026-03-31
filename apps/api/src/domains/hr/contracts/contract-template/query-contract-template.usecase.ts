import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  ContractTemplateListQueryDto,
  ContractTemplateResponseDto,
} from './contract-template.dto';
import { mapContractTemplate } from './create-contract-template.usecase';
import { Prisma } from '../../../../platform/prisma/prisma-client';
import type { PaginatedResult } from '@repo/types';

@Injectable()
export class ListAllContractTemplatesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<ContractTemplateResponseDto[]> {
    const records = await this.prisma.contractTemplate.findMany({
      include: { type: true },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapContractTemplate);
  }
}

@Injectable()
export class ListPaginatedContractTemplatesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: ContractTemplateListQueryDto,
  ): Promise<PaginatedResult<ContractTemplateResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.ContractTemplateWhereInput = {};
    if (query.contractTypeId) {
      where.contractTypeId = query.contractTypeId;
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, records] = await Promise.all([
      this.prisma.contractTemplate.count({ where }),
      this.prisma.contractTemplate.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { type: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      items: records.map(mapContractTemplate),
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
export class GetContractTemplateByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<ContractTemplateResponseDto> {
    const record = await this.prisma.contractTemplate.findUnique({
      where: { id },
      include: { type: true },
    });
    if (!record) {
      throw new NotFoundException('Contract template not found');
    }
    return mapContractTemplate(record);
  }
}
