import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapFinalSettlement } from '../offboarding.mapper';

@Injectable()
export class GetFinalSettlementUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const s = await this.prisma.finalSettlement.findUnique({ where: { id } });
    if (!s) throw new NotFoundException('Final settlement not found');
    return mapFinalSettlement(s);
  }
}
