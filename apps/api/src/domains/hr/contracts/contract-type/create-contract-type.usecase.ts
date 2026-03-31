import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  ContractTypeResponseDto,
  CreateContractTypeDto,
} from './contract-type.dto';

export function mapContractType(record: {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}): ContractTypeResponseDto {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

@Injectable()
export class CreateContractTypeUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateContractTypeDto): Promise<ContractTypeResponseDto> {
    const record = await this.prisma.contractType.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
    return mapContractType(record);
  }
}
