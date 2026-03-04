import { Injectable } from '@nestjs/common';
import type { AttendanceStatus } from '../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { AttendanceCalendarService } from './attendance-calendar.service';
import { buildUtcDateTime, normalizeDateOnly } from './attendance-date.util';

@Injectable()
export class AttendanceReconciliationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calendar: AttendanceCalendarService,
  ) {}

  async reconcileDateForUser(employeeId: string, value: Date) {
    const date = normalizeDateOnly(value);
    const existing = await this.prisma.attendanceLog.findUnique({
      where: {
        employeeId_date: { employeeId, date },
      },
    });

    if (existing && !existing.isAutoCalculated) {
      return existing;
    }

    const context = await this.calendar.getCalendarContext(employeeId, date);
    const shouldTrackWorkingDay = this.calendar.isWorkingDay(context);
    const checkInAt = existing?.checkInAt ?? null;
    const checkOutAt = existing?.checkOutAt ?? null;
    const totalMinutes =
      checkInAt && checkOutAt
        ? Math.max(
            0,
            Math.round((checkOutAt.getTime() - checkInAt.getTime()) / 60000),
          )
        : (existing?.totalMinutes ?? null);
    const expectedMinutes =
      context.schedule.day?.expectedMinutes ??
      context.schedule.standardMinutesPerDay ??
      null;
    const overtimeMinutes =
      totalMinutes != null &&
      expectedMinutes != null &&
      totalMinutes > expectedMinutes
        ? totalMinutes - expectedMinutes
        : 0;

    if (!existing && !checkInAt && !checkOutAt && !shouldTrackWorkingDay) {
      return null;
    }

    const status = this.computeStatus({
      shouldTrackWorkingDay,
      hasApprovedLeave: Boolean(context.approvedLeave) && shouldTrackWorkingDay,
      checkInAt,
      checkOutAt,
      totalMinutes,
      expectedMinutes,
      lateThresholdMinutes: context.schedule.lateThresholdMinutes,
      startMinute: context.schedule.day?.startMinute ?? null,
      endMinute: context.schedule.day?.endMinute ?? null,
      date,
    });

    const payload: {
      employeeId: string;
      date: Date;
      checkInAt: Date | null;
      checkOutAt: Date | null;
      totalMinutes: number | null;
      overtimeMinutes: number;
      status: AttendanceStatus;
      isAutoCalculated: boolean;
      reconciledAt: Date;
    } = {
      employeeId,
      date,
      checkInAt,
      checkOutAt,
      totalMinutes,
      overtimeMinutes,
      status,
      isAutoCalculated: true,
      reconciledAt: new Date(),
    };

    if (existing) {
      return this.prisma.attendanceLog.update({
        where: { id: existing.id },
        data: payload,
      });
    }

    return this.prisma.attendanceLog.create({
      data: payload,
    });
  }

  async reconcileRangeForUser(employeeId: string, start: Date, end: Date) {
    let cursor = normalizeDateOnly(start);
    const limit = normalizeDateOnly(end);

    while (cursor.getTime() <= limit.getTime()) {
      await this.reconcileDateForUser(employeeId, cursor);
      cursor = new Date(cursor);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  private computeStatus(params: {
    shouldTrackWorkingDay: boolean;
    hasApprovedLeave: boolean;
    checkInAt: Date | null;
    checkOutAt: Date | null;
    totalMinutes: number | null;
    expectedMinutes: number | null;
    lateThresholdMinutes: number;
    startMinute: number | null;
    endMinute: number | null;
    date: Date;
  }): AttendanceStatus {
    if (params.hasApprovedLeave) {
      return 'ON_LEAVE';
    }

    if (!params.shouldTrackWorkingDay) {
      return params.checkInAt || params.checkOutAt || params.totalMinutes
        ? 'PRESENT'
        : 'ABSENT';
    }

    if (!params.checkInAt && !params.checkOutAt) {
      return 'ABSENT';
    }

    if (
      params.expectedMinutes != null &&
      params.totalMinutes != null &&
      params.totalMinutes < params.expectedMinutes / 2
    ) {
      return 'HALF_DAY';
    }

    if (
      params.checkInAt &&
      params.startMinute != null &&
      params.checkInAt.getTime() >
        buildUtcDateTime(
          params.date,
          params.startMinute + params.lateThresholdMinutes,
        ).getTime()
    ) {
      return 'LATE';
    }

    if (
      params.checkOutAt &&
      params.endMinute != null &&
      params.checkOutAt.getTime() <
        buildUtcDateTime(
          params.date,
          params.endMinute - params.lateThresholdMinutes,
        ).getTime()
    ) {
      return 'EARLY_DEPARTURE';
    }

    return 'PRESENT';
  }
}
