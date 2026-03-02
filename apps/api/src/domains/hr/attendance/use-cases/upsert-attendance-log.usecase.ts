import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateOrUpdateAttendanceLogDto } from '@blih/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapAttendanceLogResponse } from '../attendance.mapper';

@Injectable()
export class UpsertAttendanceLogUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateOrUpdateAttendanceLogDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const date = new Date(dto.date);
    const existing = await this.prisma.attendanceLog.findUnique({
      where: {
        userId_date: { userId: dto.userId, date },
      },
    });

    const checkInAt = dto.checkInAt ? new Date(dto.checkInAt) : undefined;
    const checkOutAt = dto.checkOutAt ? new Date(dto.checkOutAt) : undefined;
    let totalMinutes = dto.totalMinutes ?? null;
    if (checkInAt && checkOutAt && totalMinutes == null) {
      totalMinutes = Math.round(
        (checkOutAt.getTime() - checkInAt.getTime()) / 60000,
      );
    }

    if (existing) {
      const updated = await this.prisma.attendanceLog.update({
        where: { id: existing.id },
        data: {
          ...(checkInAt !== undefined && { checkInAt }),
          ...(checkOutAt !== undefined && { checkOutAt }),
          ...(totalMinutes != null && { totalMinutes }),
          ...(dto.status !== undefined && { status: dto.status as never }),
          ...(dto.checkInMethod !== undefined && {
            checkInMethod: dto.checkInMethod,
          }),
          ...(dto.checkOutMethod !== undefined && {
            checkOutMethod: dto.checkOutMethod,
          }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
        },
      });
      return mapAttendanceLogResponse(updated);
    }

    const created = await this.prisma.attendanceLog.create({
      data: {
        userId: dto.userId,
        date,
        checkInAt: checkInAt ?? null,
        checkOutAt: checkOutAt ?? null,
        totalMinutes,
        status: (dto.status as never) ?? 'PRESENT',
        checkInMethod: dto.checkInMethod ?? undefined,
        checkOutMethod: dto.checkOutMethod ?? undefined,
        notes: dto.notes ?? undefined,
      },
    });
    return mapAttendanceLogResponse(created);
  }
}
