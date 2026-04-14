import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  ContractTypeResponseDto,
  UpdateContractTypeDto,
} from './contract-type.dto';
import { mapContractType } from './create-contract-type.usecase';

@Injectable()
export class UpdateContractTypeUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    dto: UpdateContractTypeDto,
  ): Promise<ContractTypeResponseDto> {
    const exists = await this.prisma.contractType.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException('Contract type not found');
    }

    const updated = await this.prisma.contractType.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description && { description: dto.description }),
      },
    });

    return mapContractType(updated);
  }
}
