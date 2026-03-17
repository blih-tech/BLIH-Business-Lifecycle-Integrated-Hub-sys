import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapPerformanceCalibrationResponse } from '../performance.mapper';

@Injectable()
export class ListPerformanceCalibrationsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: { periodId?: string; departmentId?: string }) {
    const calibrations = await this.prisma.performanceCalibration.findMany({
      where: {
        ...(filters.periodId ? { periodId: filters.periodId } : {}),
        ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    return calibrations.map(mapPerformanceCalibrationResponse);
  }
}
