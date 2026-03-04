import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapWorkScheduleResponse } from '../attendance-config.mapper';

@Injectable()
export class ListWorkSchedulesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const schedules = await this.prisma.workSchedule.findMany({
      include: { days: true },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    return schedules.map(mapWorkScheduleResponse);
  }
}
