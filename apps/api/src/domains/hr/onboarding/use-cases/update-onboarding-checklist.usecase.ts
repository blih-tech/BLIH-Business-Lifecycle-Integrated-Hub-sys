import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateOnboardingChecklistDto } from '@blih/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapOnboardingChecklistResponse } from '../onboarding.mapper';

@Injectable()
export class UpdateOnboardingChecklistUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateOnboardingChecklistDto) {
    const existing = await this.prisma.onboardingChecklist.findUnique({
      where: { id },
      include: { tasks: true },
    });
    if (!existing)
      throw new NotFoundException('Onboarding checklist not found');

    const updated = await this.prisma.onboardingChecklist.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status as never }),
        ...(dto.teamLeadVerifiedAt !== undefined && {
          teamLeadVerifiedAt: dto.teamLeadVerifiedAt
            ? new Date(dto.teamLeadVerifiedAt)
            : null,
        }),
        ...(dto.ceoSignOffAt !== undefined && {
          ceoSignOffAt: dto.ceoSignOffAt ? new Date(dto.ceoSignOffAt) : null,
        }),
      },
      include: { tasks: true },
    });
    return mapOnboardingChecklistResponse(updated);
  }
}
