import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import type { CreateHolidayDto } from '@blih/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapHolidayResponse } from '../attendance-config.mapper';
import { normalizeDateOnly } from '../attendance-date.util';

@Injectable()
export class CreateHolidayUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateHolidayDto) {
    const name = dto.name.trim();
    if (!name) {
      throw new BadRequestException('Holiday name is required');
    }

    if (dto.countryId) {
      const country = await this.prisma.countryReference.findUnique({
        where: { id: dto.countryId },
        select: { id: true },
      });
      if (!country) {
        throw new BadRequestException('Country not found');
      }
    }

    try {
      const created = await this.prisma.holiday.create({
        data: {
          name,
          date: normalizeDateOnly(dto.date),
          countryId: dto.countryId ?? undefined,
          isRecurringAnnual: dto.isRecurringAnnual ?? false,
        },
      });

      return mapHolidayResponse(created);
    } catch (error) {
      if (error instanceof Error && /unique/i.test(error.message)) {
        throw new ConflictException('Holiday already exists for this date');
      }
      throw error;
    }
  }
}
