import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import type { CreateWorkScheduleDto } from '@blih/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapWorkScheduleResponse } from '../attendance-config.mapper';
import { normalizeWorkScheduleDays } from '../work-schedule.validation';

@Injectable()
export class CreateWorkScheduleUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateWorkScheduleDto) {
    const name = dto.name.trim();
    if (!name) {
      throw new BadRequestException('Schedule name is required');
    }

    const days = normalizeWorkScheduleDays(dto.days);

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        if (dto.isDefault) {
          await tx.workSchedule.updateMany({
            where: { isDefault: true },
            data: { isDefault: false },
          });
        }

        return tx.workSchedule.create({
          data: {
            name,
            description: dto.description ?? undefined,
            timezone: dto.timezone ?? undefined,
            isDefault: dto.isDefault ?? false,
            lateThresholdMinutes: dto.lateThresholdMinutes ?? 15,
            standardMinutesPerDay: dto.standardMinutesPerDay ?? 480,
            days: {
              createMany: {
                data: days,
              },
            },
          },
          include: { days: true },
        });
      });

      return mapWorkScheduleResponse(created);
    } catch (error) {
      if (error instanceof Error && /unique/i.test(error.message)) {
        throw new ConflictException('Work schedule name already exists');
      }
      throw error;
    }
  }
}
