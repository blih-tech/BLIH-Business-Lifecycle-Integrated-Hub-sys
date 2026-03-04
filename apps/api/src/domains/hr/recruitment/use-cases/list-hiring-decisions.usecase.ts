import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapHiringDecisionResponse } from '../hiring-decision.mapper';

@Injectable()
export class ListHiringDecisionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: {
    finalDecision?: string;
    recruitmentRequestId?: string;
    candidateId?: string;
  }) {
    const decisions = await this.prisma.hiringDecision.findMany({
      where: {
        ...(filters.finalDecision
          ? { finalDecision: filters.finalDecision as never }
          : {}),
        ...(filters.recruitmentRequestId
          ? { recruitmentRequestId: filters.recruitmentRequestId }
          : {}),
        ...(filters.candidateId ? { candidateId: filters.candidateId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        submittedBy: { select: { email: true } },
        onboarding: { select: { status: true } },
      },
    });

    return decisions.map(mapHiringDecisionResponse);
  }
}
