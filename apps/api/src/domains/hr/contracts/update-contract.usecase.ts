import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import type { ContractResponseDto, UpdateContractDto } from './contracts.dto';
import { mapContract } from './create-contract.usecase';

@Injectable()
export class UpdateContractUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    dto: UpdateContractDto,
  ): Promise<ContractResponseDto> {
    const exists = await this.prisma.contract.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException('Contract not found');
    }

    if (dto.templateId) {
      const template = await this.prisma.contractTemplate.findUnique({
        where: { id: dto.templateId },
      });
      if (!template) throw new BadRequestException('Template not found');
    }

    if (dto.employeeContractId) {
      const empContract = await this.prisma.employeeContract.findUnique({
        where: { id: dto.employeeContractId },
      });
      if (!empContract)
        throw new BadRequestException('EmployeeContract not found');
    }

    // Process update
    const record = await this.prisma.contract.update({
      where: { id },
      data: {
        ...(dto.templateId && { templateId: dto.templateId }),
        ...(dto.employeeContractId && {
          employeeContractId: dto.employeeContractId,
        }),
        ...(dto.signedFileUrl && { signedFileUrl: dto.signedFileUrl }),
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

    // Note: To fully support syncing `signers` on UpdateContractDto, additional logic would handle deleting/creating signers here.
    // For MVP, we update main fields. Additional nested updates can be done separately or recursively.

    return mapContract(record);
  }
}
