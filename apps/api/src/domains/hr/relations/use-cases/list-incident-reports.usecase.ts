import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapIncidentReport } from '../relations.mapper';

@Injectable()
export class ListIncidentReportsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { status?: string; severity?: string }) {
    const where: Record<string, string> = {};
    if (filters.status) where.status = filters.status;
    if (filters.severity) where.severity = filters.severity;
    const list = await this.prisma.incidentReport.findMany({
      where: where as never,
      orderBy: { createdAt: 'desc' },
    });
    return list.map(mapIncidentReport);
  }
}
