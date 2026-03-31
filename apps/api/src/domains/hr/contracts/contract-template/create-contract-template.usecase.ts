import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  ContractTemplateResponseDto,
  CreateContractTemplateDto,
} from './contract-template.dto';

export function mapContractTemplate(record: {
  id: string;
  title: string;
  description: string;
  contractTypeId: string;
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
  type: {
    id: string;
    name: string;
  };
}): ContractTemplateResponseDto {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    contractTypeId: record.contractTypeId,
    fileUrl: record.fileUrl,
    type: {
      id: record.type.id,
      name: record.type.name,
    },
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

@Injectable()
export class CreateContractTemplateUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    dto: CreateContractTemplateDto,
  ): Promise<ContractTemplateResponseDto> {
    const typeExists = await this.prisma.contractType.findUnique({
      where: { id: dto.contractTypeId },
    });
    if (!typeExists) {
      throw new BadRequestException(
        'contractTypeId does not reference an existing contract type',
      );
    }

    const record = await this.prisma.contractTemplate.create({
      data: {
        title: dto.title,
        description: dto.description,
        contractTypeId: dto.contractTypeId,
        fileUrl: dto.fileUrl,
      },
      include: { type: true },
    });
    return mapContractTemplate(record);
  }
}
