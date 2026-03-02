import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AssignUserWorkScheduleDto } from '@blih/types';
import { HrUserLifecycleService } from '../../hr-user-lifecycle.service';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapUserWorkScheduleResponse } from '../attendance-config.mapper';
import { normalizeDateOnly } from '../attendance-date.util';

@Injectable()
export class AssignUserWorkScheduleUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lifecycle: HrUserLifecycleService,
  ) {}

  async execute(dto: AssignUserWorkScheduleDto) {
    await this.lifecycle.assertAttendanceAllowed(dto.userId);

    const schedule = await this.prisma.workSchedule.findUnique({
      where: { id: dto.scheduleId },
      select: { id: true },
    });
    if (!schedule) {
      throw new NotFoundException('Work schedule not found');
    }

    const effectiveFrom = normalizeDateOnly(dto.effectiveFrom);
    const effectiveTo = dto.effectiveTo
      ? normalizeDateOnly(dto.effectiveTo)
      : null;

    if (effectiveTo && effectiveTo.getTime() < effectiveFrom.getTime()) {
      throw new BadRequestException(
        'effectiveTo must be on or after effectiveFrom',
      );
    }

    const overlapping = await this.prisma.userWorkSchedule.findFirst({
      where: {
        userId: dto.userId,
        effectiveFrom: {
          lte: effectiveTo ?? new Date('9999-12-31T00:00:00.000Z'),
        },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: effectiveFrom } }],
      },
      select: { id: true },
    });
    if (overlapping) {
      throw new BadRequestException(
        'The user already has an overlapping work schedule assignment',
      );
    }

    const created = await this.prisma.userWorkSchedule.create({
      data: {
        userId: dto.userId,
        scheduleId: dto.scheduleId,
        effectiveFrom,
        effectiveTo,
      },
      include: {
        schedule: {
          select: { name: true },
        },
      },
    });

    return mapUserWorkScheduleResponse(created);
  }
}
