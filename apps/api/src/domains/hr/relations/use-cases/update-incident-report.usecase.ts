import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateIncidentReportDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapIncidentReport } from '../relations.mapper';

@Injectable()
export class UpdateIncidentReportUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateIncidentReportDto) {
    const existing = await this.prisma.incidentReport.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Incident report not found');
    const data: Record<string, unknown> = {};
    if (dto.investigatorId !== undefined)
      data.investigatorId = dto.investigatorId;
    if (dto.investigationNotes !== undefined)
      data.investigationNotes = dto.investigationNotes;
    if (dto.rootCause !== undefined) data.rootCause = dto.rootCause;
    if (dto.preventiveActions !== undefined)
      data.preventiveActions = dto.preventiveActions;
    if (dto.status !== undefined) data.status = dto.status;
    const updated = await this.prisma.incidentReport.update({
      where: { id },
      data: data as never,
    });
    return mapIncidentReport(updated);
  }
}
