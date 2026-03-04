import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapPromotionProposal } from '../talent.mapper';

@Injectable()
export class GetPromotionProposalUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const proposal = await this.prisma.promotionProposal.findUnique({
      where: { id },
    });
    if (!proposal) {
      throw new NotFoundException('Promotion proposal not found');
    }
    return mapPromotionProposal(proposal);
  }
}
