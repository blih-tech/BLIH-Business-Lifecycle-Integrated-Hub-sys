import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapAttendanceLogResponse } from '../attendance.mapper';

@Injectable()
export class GetAttendanceLogUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const row = await this.prisma.attendanceLog.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Attendance log not found');
    return mapAttendanceLogResponse(row);
  }
}
