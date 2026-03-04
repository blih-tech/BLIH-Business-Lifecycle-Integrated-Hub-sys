import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapHiringDecisionResponse } from '../hiring-decision.mapper';

@Injectable()
export class GetHiringDecisionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const decision = await this.prisma.hiringDecision.findUnique({
      where: { id },
      include: {
        submittedBy: { select: { email: true } },
        onboarding: { select: { status: true } },
      },
    });
    if (!decision) throw new NotFoundException('Hiring decision not found');

    return mapHiringDecisionResponse(decision);
  }
}
