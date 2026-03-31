import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import type {
  ContractListQueryDto,
  ContractResponseDto,
} from './contracts.dto';
import { mapContract } from './create-contract.usecase';
import { Prisma } from '../../../platform/prisma/prisma-client';
import type { PaginatedResult } from '@repo/types';

@Injectable()
export class ListAllContractsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<ContractResponseDto[]> {
    const records = await this.prisma.contract.findMany({
      include: {
        template: true,
        signers: {
          include: {
            user: {
              include: {
                employee: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(mapContract);
  }
}

@Injectable()
export class ListPaginatedContractsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: ContractListQueryDto,
  ): Promise<PaginatedResult<ContractResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.ContractWhereInput = {};
    if (query.templateId) where.templateId = query.templateId;
    if (query.employeeContractId)
      where.employeeContractId = query.employeeContractId;

    // Filter contracts where a specific user is an assigned signer
    if (query.signerUserId) {
      where.signers = {
        some: { userId: query.signerUserId },
      };
    }

    // Filter contracts pending a specific user's signature
    if (query.pendingSignatureByUserId) {
      where.signers = {
        some: {
          userId: query.pendingSignatureByUserId,
          hasSigned: false,
        },
      };
    }

    const [total, records] = await Promise.all([
      this.prisma.contract.count({ where }),
      this.prisma.contract.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          template: true,
          signers: {
            include: {
              user: {
                include: {
                  employee: {
                    include: {
                      profile: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      items: records.map(mapContract),
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
export class GetContractByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<ContractResponseDto> {
    const record = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        template: true,
        signers: {
          include: {
            user: {
              include: {
                employee: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!record) throw new NotFoundException('Contract not found');
    return mapContract(record);
  }
}
