import { Injectable } from '@nestjs/common';
import type { CreateConflictMediationDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../../employees/employee-subject.utils';
import { mapConflictMediation } from '../relations.mapper';

@Injectable()
export class CreateMediationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateConflictMediationDto) {
    const requesterEmployee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      dto.requesterEmployeeId,
      'Requester employee not found',
    );
    const otherPartyEmployee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      dto.otherPartyEmployeeId,
      'Other party employee not found',
    );
    const mediation = await this.prisma.conflictMediation.create({
      data: {
        requesterEmployeeId: requesterEmployee.id,
        otherPartyEmployeeId: otherPartyEmployee.id,
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
