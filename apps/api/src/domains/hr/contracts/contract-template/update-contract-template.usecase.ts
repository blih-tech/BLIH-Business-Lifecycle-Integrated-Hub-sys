import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  ContractTemplateResponseDto,
  UpdateContractTemplateDto,
} from './contract-template.dto';
import { mapContractTemplate } from './create-contract-template.usecase';

@Injectable()
export class UpdateContractTemplateUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    dto: UpdateContractTemplateDto,
  ): Promise<ContractTemplateResponseDto> {
    const exists = await this.prisma.contractTemplate.findUnique({
      where: { id },
    });
    if (!exists) {
      throw new NotFoundException('Contract template not found');
    }

    if (dto.contractTypeId) {
      const typeExists = await this.prisma.contractType.findUnique({
        where: { id: dto.contractTypeId },
      });
      if (!typeExists) {
        throw new BadRequestException(
          'contractTypeId does not reference an existing contract type',
        );
      }
    }

    const updated = await this.prisma.contractTemplate.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description && { description: dto.description }),
        ...(dto.contractTypeId && { contractTypeId: dto.contractTypeId }),
        ...(dto.fileUrl && { fileUrl: dto.fileUrl }),
      },
      include: { type: true },
    });

    return mapContractTemplate(updated);
  }
}
