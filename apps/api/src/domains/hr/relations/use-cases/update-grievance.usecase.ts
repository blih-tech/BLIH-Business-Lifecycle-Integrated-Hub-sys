import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateGrievanceDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapGrievance } from '../relations.mapper';

@Injectable()
export class UpdateGrievanceUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateGrievanceDto) {
    const existing = await this.prisma.grievance.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Grievance not found');
    const data: Record<string, unknown> = {};
    if (dto.assignedToId !== undefined) data.assignedToId = dto.assignedToId;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.resolutionNotes !== undefined)
      data.resolutionNotes = dto.resolutionNotes;
    if (dto.closedAt !== undefined)
      data.closedAt = dto.closedAt ? new Date(dto.closedAt) : null;
    const updated = await this.prisma.grievance.update({
      where: { id },
      data: data as never,
    });
    return mapGrievance(updated);
  }
}
