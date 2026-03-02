import { Injectable } from '@nestjs/common';
import type { CreateConflictMediationDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapConflictMediation } from '../relations.mapper';

@Injectable()
export class CreateMediationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateConflictMediationDto) {
    await this.prisma.user.findUniqueOrThrow({
      where: { id: dto.requesterId },
    });
    await this.prisma.user.findUniqueOrThrow({
      where: { id: dto.otherPartyId },
    });
    const mediation = await this.prisma.conflictMediation.create({
      data: {
        requesterId: dto.requesterId,
        otherPartyId: dto.otherPartyId,
        nature: dto.nature,
        duration: dto.duration ?? null,
        attemptedResolutions: dto.attemptedResolutions ?? null,
        workImpact: dto.workImpact ?? null,
        desiredOutcome: dto.desiredOutcome ?? null,
        status: 'PENDING',
      },
    });
    return mapConflictMediation(mediation);
  }
}
