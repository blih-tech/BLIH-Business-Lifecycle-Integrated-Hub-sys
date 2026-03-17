import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateConflictMediationDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapConflictMediation } from '../relations.mapper';

@Injectable()
export class UpdateMediationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateConflictMediationDto) {
    const existing = await this.prisma.conflictMediation.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Conflict mediation not found');
    if (dto.mediatorId)
      await this.prisma.user.findUniqueOrThrow({
        where: { id: dto.mediatorId },
      });
    const data: Record<string, unknown> = {};
    if (dto.mediatorId !== undefined) data.mediatorId = dto.mediatorId;
    if (dto.sessionDates !== undefined) data.sessionDates = dto.sessionDates;
    if (dto.agreementReached !== undefined)
      data.agreementReached = dto.agreementReached;
    if (dto.agreementNotes !== undefined)
      data.agreementNotes = dto.agreementNotes;
    if (dto.status !== undefined) data.status = dto.status;
    const updated = await this.prisma.conflictMediation.update({
      where: { id },
      data: data as never,
    });
    return mapConflictMediation(updated);
  }
}
