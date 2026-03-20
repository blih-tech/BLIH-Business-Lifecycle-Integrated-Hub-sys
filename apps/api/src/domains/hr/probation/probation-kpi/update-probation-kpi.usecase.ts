import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type { UpdateKpiDto } from './probation-kpi.dto';
import { mapKpi } from './create-probation-kpi.usecase';

@Injectable()
export class UpdateKpiUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateKpiDto) {
    const existing = await this.prisma.kPI.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('KPI not found');
    }

    const updated = await this.prisma.kPI.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });

    return mapKpi(updated);
  }
}
