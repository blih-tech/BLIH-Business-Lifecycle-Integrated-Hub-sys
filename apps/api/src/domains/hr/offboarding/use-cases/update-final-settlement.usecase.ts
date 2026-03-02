import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateFinalSettlementDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapFinalSettlement } from '../offboarding.mapper';

@Injectable()
export class UpdateFinalSettlementUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateFinalSettlementDto) {
    const existing = await this.prisma.finalSettlement.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Final settlement not found');
    const data: Record<string, unknown> = {};
    if (dto.approvedById !== undefined) data.approvedById = dto.approvedById;
    if (dto.paidAt !== undefined)
      data.paidAt = dto.paidAt ? new Date(dto.paidAt) : null;
    const updated = await this.prisma.finalSettlement.update({
      where: { id },
      data: data as never,
    });
    return mapFinalSettlement(updated);
  }
}
