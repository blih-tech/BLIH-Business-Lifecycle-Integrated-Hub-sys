import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import type { ContractResponseDto, CreateContractDto } from './contracts.dto';

export function mapContract(record: any): ContractResponseDto {
  return {
    id: record.id,
    templateId: record.templateId,
    templateTitle: record.template?.title || '',
    employeeContractId: record.employeeContractId || undefined,
    signedFileUrl: record.signedFileUrl || undefined,
    signers:
      record.signers?.map((signer: any) => ({
        id: signer.id,
        userId: signer.userId,
        userName:
          `${signer.user?.profile?.firstName || ''} ${signer.user?.profile?.lastName || ''}`.trim(),
        roleInContract: signer.roleInContract,
        hasSigned: signer.hasSigned,
        signedAt: signer.signedAt ? signer.signedAt.toISOString() : undefined,
      })) || [],
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

@Injectable()
export class CreateContractUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateContractDto): Promise<ContractResponseDto> {
    const template = await this.prisma.contractTemplate.findUnique({
      where: { id: dto.templateId },
    });
    if (!template) {
      throw new BadRequestException('Template not found');
    }

    if (dto.employeeContractId) {
      const empContract = await this.prisma.employeeContract.findUnique({
        where: { id: dto.employeeContractId },
      });
      if (!empContract) {
        throw new BadRequestException('EmployeeContract not found');
      }
    }

    const signersData = (dto.signers || []).map((s) => ({
      userId: s.userId,
      roleInContract: s.roleInContract,
      hasSigned: false,
    }));

    // Verify user IDs exist if any signers are provided
    if (signersData.length > 0) {
      const userIds = signersData.map((s) => s.userId);
      const uniqueUserIds = [...new Set(userIds)];
      if (uniqueUserIds.length !== userIds.length) {
        throw new BadRequestException('Duplicate users in signers list');
      }

      const foundUsers = await this.prisma.user.findMany({
        where: { id: { in: uniqueUserIds } },
      });
      if (foundUsers.length !== uniqueUserIds.length) {
        throw new BadRequestException(
          'One or more user IDs in signers do not exist',
        );
      }
    }

    const record = await this.prisma.contract.create({
      data: {
        templateId: dto.templateId,
        employeeContractId: dto.employeeContractId,
        signers: {
          create: signersData,
        },
      },
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

    return mapContract(record);
  }
}
