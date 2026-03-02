import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapAttendanceLogResponse } from '../attendance.mapper';

@Injectable()
export class ListAttendanceLogsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: {
    userId: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const where: { userId: string; date?: { gte?: Date; lte?: Date } } = {
      userId: filters.userId,
    };
    if (filters.fromDate) {
      where.date = { ...where.date, gte: new Date(filters.fromDate) };
    }
    if (filters.toDate) {
      where.date = { ...where.date, lte: new Date(filters.toDate) };
    }

    const list = await this.prisma.attendanceLog.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    return list.map(mapAttendanceLogResponse);
  }
}
