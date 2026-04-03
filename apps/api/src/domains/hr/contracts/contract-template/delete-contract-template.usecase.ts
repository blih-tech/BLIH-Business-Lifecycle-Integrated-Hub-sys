import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';

@Injectable()
export class DeleteContractTemplateUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<void> {
    const exists = await this.prisma.contractTemplate.findUnique({
      where: { id },
    });
    if (!exists) {
      throw new NotFoundException('Contract template not found');
    }

    await this.prisma.contractTemplate.delete({ where: { id } });
  }
}
