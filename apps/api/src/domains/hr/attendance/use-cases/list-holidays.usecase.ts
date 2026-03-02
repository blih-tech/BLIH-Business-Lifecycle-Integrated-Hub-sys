import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapHolidayResponse } from '../attendance-config.mapper';
import { normalizeDateOnly } from '../attendance-date.util';

@Injectable()
export class ListHolidaysUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: {
    fromDate?: string;
    toDate?: string;
    countryId?: string;
  }) {
    const where: {
      date?: { gte?: Date; lte?: Date };
      OR?: Array<{ countryId: string | null }>;
    } = {};

    if (filters.fromDate) {
      where.date = { ...where.date, gte: normalizeDateOnly(filters.fromDate) };
    }
    if (filters.toDate) {
      where.date = { ...where.date, lte: normalizeDateOnly(filters.toDate) };
    }
    if (filters.countryId) {
      where.OR = [{ countryId: filters.countryId }, { countryId: null }];
    }

    const holidays = await this.prisma.holiday.findMany({
      where,
      orderBy: [{ date: 'asc' }, { name: 'asc' }],
    });

    return holidays.map(mapHolidayResponse);
  }
}
