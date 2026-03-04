import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapOnboardingChecklistResponse } from '../onboarding.mapper';

@Injectable()
export class GetOnboardingChecklistUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const checklist = await this.prisma.onboardingChecklist.findUnique({
      where: { id },
      include: { tasks: true },
    });
    if (!checklist)
      throw new NotFoundException('Onboarding checklist not found');
    return mapOnboardingChecklistResponse(checklist);
  }
}
