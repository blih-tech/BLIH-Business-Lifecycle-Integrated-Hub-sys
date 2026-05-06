import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';

@Injectable()
export class DeleteContractUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<void> {
    const exists = await this.prisma.contract.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Contract not found');
    // Prisma cascading on signers will handle them
    await this.prisma.contract.delete({ where: { id } });
  }
}
