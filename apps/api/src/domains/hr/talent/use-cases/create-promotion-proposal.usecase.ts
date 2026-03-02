import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreatePromotionProposalDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapPromotionProposal } from '../talent.mapper';

@Injectable()
export class CreatePromotionProposalUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreatePromotionProposalDto) {
    await this.prisma.user.findUniqueOrThrow({ where: { id: dto.userId } });
    await this.prisma.user.findUniqueOrThrow({
      where: { id: dto.proposedById },
    });
    const targetPosition = await this.prisma.position.findUniqueOrThrow({
      where: { id: dto.toPositionId },
    });

    const employment = await this.prisma.userEmployment.findUnique({
      where: { userId: dto.userId },
      select: {
        positionId: true,
      },
    });
    if (!employment?.positionId) {
      throw new BadRequestException(
        'Promotion proposals require an active employment position',
      );
    }
    if (employment.positionId === targetPosition.id) {
      throw new BadRequestException(
        'Target position must differ from the current position',
      );
    }

    const latestReview = await this.prisma.performanceReview.findFirst({
      where: { userId: dto.userId, status: 'COMPLETED' },
      orderBy: [{ completedAt: 'desc' }],
      select: {
        id: true,
        finalRating: true,
        category: true,
        promotionEligible: true,
        raiseRecommendation: true,
      },
    });
    if (!latestReview?.promotionEligible) {
      throw new BadRequestException(
        'Promotion proposal requires a completed promotion-eligible performance review',
      );
    }

    const currentYear = new Date().getUTCFullYear();
    const okrAggregate = await this.prisma.okr.aggregate({
      where: {
        userId: dto.userId,
        scope: 'USER',
        periodYear: currentYear,
      },
      _avg: {
        overallProgress: true,
      },
    });
    const averageOkrProgress = okrAggregate._avg.overallProgress ?? 0;
    if (averageOkrProgress < 70) {
      throw new BadRequestException(
        'Promotion proposal requires average current-year user OKR progress of at least 70%',
      );
    }

    const proposal = await this.prisma.promotionProposal.create({
      data: {
        userId: dto.userId,
        fromPositionId: employment.positionId,
        toPositionId: dto.toPositionId,
        proposedById: dto.proposedById,
        justification: {
          ...(dto.justification ?? {}),
          latestPerformanceReview: {
            reviewId: latestReview.id,
            finalRating:
              latestReview.finalRating != null
                ? Number(latestReview.finalRating)
                : null,
            category: latestReview.category,
            raiseRecommendation: latestReview.raiseRecommendation,
          },
          okrSummary: {
            year: currentYear,
            averageProgress: Math.round(averageOkrProgress),
          },
        } as never,
      },
    });

    return mapPromotionProposal(proposal);
  }
}
