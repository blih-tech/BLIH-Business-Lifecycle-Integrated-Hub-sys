import { Injectable } from '@nestjs/common';
import type { CreateIncidentReportDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import {
  getSlaHoursForSeverity,
  getInvestigationDueAt,
} from '../incident.utils';
import { mapIncidentReport } from '../relations.mapper';

@Injectable()
export class CreateIncidentReportUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateIncidentReportDto) {
    await this.prisma.user.findUniqueOrThrow({ where: { id: dto.userId } });
    const year = new Date().getFullYear();
    const prefix = `INC-${year}-`;
    const existing = await this.prisma.incidentReport.findMany({
      where: { reportId: { startsWith: prefix } },
      orderBy: { reportId: 'desc' },
      take: 1,
    });
    const nextNum =
      existing.length === 0
        ? 1
        : parseInt(existing[0].reportId.slice(prefix.length), 10) + 1;
    const reportId = `${prefix}${String(nextNum).padStart(3, '0')}`;
    const slaHours = getSlaHoursForSeverity(dto.severity);
    const investigationDueAt = getInvestigationDueAt(slaHours);
    const incident = await this.prisma.incidentReport.create({
      data: {
        reportId,
        userId: dto.userId,
        incidentType: dto.incidentType as never,
        severity: dto.severity as never,
        description: dto.description,
        location: dto.location ?? null,
        occurredAt: new Date(dto.occurredAt),
        peopleInvolved: (dto.peopleInvolved ?? null) as never,
        immediateActions: (dto.immediateActions ?? null) as never,
        slaHours,
        investigationDueAt,
        status: 'OPEN',
      },
    });
    return mapIncidentReport(incident);
  }
}
