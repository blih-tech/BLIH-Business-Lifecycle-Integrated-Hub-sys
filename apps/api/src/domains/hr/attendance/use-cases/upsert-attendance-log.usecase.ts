import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreateOrUpdateAttendanceLogDto } from '@repo/types';
import { Prisma } from '../../../../platform/prisma/prisma-client';
import { HrUserLifecycleService } from '../../hr-user-lifecycle.service';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapAttendanceLogResponse } from '../attendance.mapper';
import { AttendanceReconciliationService } from '../attendance-reconciliation.service';
import { normalizeDateOnly } from '../attendance-date.util';

@Injectable()
export class UpsertAttendanceLogUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lifecycle: HrUserLifecycleService,
    private readonly reconciliation: AttendanceReconciliationService,
  ) {}

  async execute(dto: CreateOrUpdateAttendanceLogDto) {
    await this.lifecycle.assertAttendanceAllowed(dto.userId);

    const date = normalizeDateOnly(dto.date);
    const existing = await this.prisma.attendanceLog.findUnique({
      where: {
        userId_date: { userId: dto.userId, date },
      },
    });

    const checkInAt =
      dto.checkInAt === undefined
        ? undefined
        : dto.checkInAt
          ? new Date(dto.checkInAt)
          : null;
    const checkOutAt =
      dto.checkOutAt === undefined
        ? undefined
        : dto.checkOutAt
          ? new Date(dto.checkOutAt)
          : null;

    if (checkInAt && checkOutAt && checkOutAt.getTime() < checkInAt.getTime()) {
      throw new BadRequestException('checkOutAt must be on or after checkInAt');
    }

    let totalMinutes =
      dto.totalMinutes === undefined ? undefined : (dto.totalMinutes ?? null);
    if (checkInAt && checkOutAt && totalMinutes == null) {
      totalMinutes = Math.max(
        0,
        Math.round((checkOutAt.getTime() - checkInAt.getTime()) / 60000),
      );
    }

    const shouldAutoCalculate =
      dto.recalculateStatus ?? dto.status === undefined;

    const saved = existing
      ? await this.updateExisting(existing.id, dto, {
          checkInAt,
          checkOutAt,
          totalMinutes,
          shouldAutoCalculate,
        })
      : await this.createNew(dto, date, {
          checkInAt,
          checkOutAt,
          totalMinutes,
          shouldAutoCalculate,
        });

    if (!shouldAutoCalculate) {
      return mapAttendanceLogResponse(saved);
    }

    const reconciled = await this.reconciliation.reconcileDateForUser(
      dto.userId,
      date,
    );

    return mapAttendanceLogResponse(reconciled ?? saved);
  }

  private updateExisting(
    id: string,
    dto: CreateOrUpdateAttendanceLogDto,
    params: {
      checkInAt: Date | null | undefined;
      checkOutAt: Date | null | undefined;
      totalMinutes: number | null | undefined;
      shouldAutoCalculate: boolean;
    },
  ) {
    const data: Prisma.AttendanceLogUncheckedUpdateInput = {};

    if (params.checkInAt !== undefined) {
      data.checkInAt = params.checkInAt;
    }
    if (params.checkOutAt !== undefined) {
      data.checkOutAt = params.checkOutAt;
    }
    if (params.totalMinutes !== undefined) {
      data.totalMinutes = params.totalMinutes;
    }
    if (dto.checkInMethod !== undefined) {
      data.checkInMethod = dto.checkInMethod;
    }
    if (dto.checkOutMethod !== undefined) {
      data.checkOutMethod = dto.checkOutMethod;
    }
    if (dto.checkInIp !== undefined) {
      data.checkInIp = dto.checkInIp;
    }
    if (dto.checkInLocation !== undefined) {
      data.checkInLocation =
        dto.checkInLocation === null
          ? Prisma.JsonNull
          : (dto.checkInLocation as Prisma.InputJsonValue);
    }
    if (dto.overtimeApproved !== undefined) {
      data.overtimeApproved = dto.overtimeApproved ?? false;
    }
    if (dto.notes !== undefined) {
      data.notes = dto.notes;
    }

    if (params.shouldAutoCalculate) {
      data.isAutoCalculated = true;
    } else {
      data.isAutoCalculated = false;
      data.status = (dto.status ?? 'PRESENT') as never;
      data.reconciledAt = new Date();
    }

    return this.prisma.attendanceLog.update({
      where: { id },
      data,
    });
  }

  private createNew(
    dto: CreateOrUpdateAttendanceLogDto,
    date: Date,
    params: {
      checkInAt: Date | null | undefined;
      checkOutAt: Date | null | undefined;
      totalMinutes: number | null | undefined;
      shouldAutoCalculate: boolean;
    },
  ) {
    const data: Prisma.AttendanceLogUncheckedCreateInput = {
      userId: dto.userId,
      date,
      checkInAt: params.checkInAt ?? null,
      checkOutAt: params.checkOutAt ?? null,
      totalMinutes: params.totalMinutes ?? null,
      isAutoCalculated: params.shouldAutoCalculate,
      status: params.shouldAutoCalculate
        ? 'PRESENT'
        : ((dto.status ?? 'PRESENT') as never),
      checkInMethod: dto.checkInMethod ?? undefined,
      checkOutMethod: dto.checkOutMethod ?? undefined,
      checkInIp: dto.checkInIp ?? undefined,
      overtimeApproved: dto.overtimeApproved ?? false,
      notes: dto.notes ?? undefined,
      reconciledAt: params.shouldAutoCalculate ? null : new Date(),
    };

    if (dto.checkInLocation !== undefined) {
      data.checkInLocation =
        dto.checkInLocation === null
          ? Prisma.JsonNull
          : (dto.checkInLocation as Prisma.InputJsonValue);
    }

    return this.prisma.attendanceLog.create({
      data,
    });
  }
}
