import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateResignationDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapResignation } from '../offboarding.mapper';

@Injectable()
export class UpdateResignationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateResignationDto) {
    const existing = await this.prisma.resignation.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Resignation not found');
    const data: Record<string, unknown> = {};
    if (dto.actualLastDay !== undefined)
      data.actualLastDay = dto.actualLastDay
        ? new Date(dto.actualLastDay)
        : null;
    if (dto.approvedById !== undefined) data.approvedById = dto.approvedById;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.handoverPlan !== undefined) data.handoverPlan = dto.handoverPlan;
    if (dto.status === 'SUBMITTED' && !existing.submittedAt)
      data.submittedAt = new Date();
    const updated = await this.prisma.resignation.update({
      where: { id },
      data: data as never,
    });
    return mapResignation(updated);
  }
}
