import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapPromotionProposal } from '../talent.mapper';

@Injectable()
export class ListPromotionProposalsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { employeeId?: string; status?: string }) {
    const proposals = await this.prisma.promotionProposal.findMany({
      where: {
        ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
        ...(filters.status ? { status: filters.status as never } : {}),
      },
      orderBy: [{ createdAt: 'desc' }],
    });
    return proposals.map(mapPromotionProposal);
  }
}
