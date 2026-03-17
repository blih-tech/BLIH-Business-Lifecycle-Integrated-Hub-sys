import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapIncidentReport } from '../relations.mapper';

@Injectable()
export class GetIncidentReportUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const r = await this.prisma.incidentReport.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Incident report not found');
    return mapIncidentReport(r);
  }
}
