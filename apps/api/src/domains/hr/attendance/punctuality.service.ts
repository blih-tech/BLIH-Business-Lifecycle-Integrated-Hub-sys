import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreatePunctualityAlertDto } from '@repo/types';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../employees/employee-subject.utils';
import { AttendanceCalendarService } from './attendance-calendar.service';
import { buildUtcDateTime, normalizeDateOnly } from './attendance-date.util';

@Injectable()
export class PunctualityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calendar: AttendanceCalendarService,
  ) {}

  async list(employeeId: string, fromDate: string, toDate: string) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      employeeId,
    );
    const start = normalizeDateOnly(fromDate);
    const end = normalizeDateOnly(toDate);
    if (end.getTime() < start.getTime()) {
      throw new BadRequestException('toDate must be on or after fromDate');
    }

    const logs = await this.prisma.attendanceLog.findMany({
      where: {
        employeeId: employee.id,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'desc' },
    });

    return Promise.all(
      logs.map(async (log) => {
        const context = await this.calendar.getCalendarContext(
          employee.id,
          log.date,
        );
        const expectedStartMinute = context.schedule.day?.startMinute ?? null;
        const minutesLate =
          log.checkInAt && expectedStartMinute != null
            ? Math.max(
                0,
                Math.round(
                  (log.checkInAt.getTime() -
                    buildUtcDateTime(log.date, expectedStartMinute).getTime()) /
                    60000,
                ),
              )
            : 0;

        return {
          employeeId: log.employeeId,
          date: log.date.toISOString().slice(0, 10),
          status: log.status,
          expectedStartMinute,
          actualCheckInAt: log.checkInAt?.toISOString() ?? null,
          lateThresholdMinutes: context.schedule.lateThresholdMinutes ?? null,
          minutesLate,
          totalMinutes: log.totalMinutes,
        };
      }),
    );
  }

  async trends(employeeId: string, fromDate: string, toDate: string) {
    const items = await this.list(employeeId, fromDate, toDate);
    const lateDays = items.filter((item) => item.status === 'LATE').length;
    const earlyDepartureDays = items.filter(
      (item) => item.status === 'EARLY_DEPARTURE',
    ).length;
    const absentDays = items.filter((item) => item.status === 'ABSENT').length;
    const totalTrackedDays = items.length;
    const averageMinutesLate =
      lateDays === 0
        ? 0
        : Number(
            (
              items.reduce((total, item) => total + item.minutesLate, 0) /
              lateDays
            ).toFixed(2),
          );
    const punctualDays =
      totalTrackedDays - lateDays - earlyDepartureDays - absentDays;
    const punctualityRate =
      totalTrackedDays === 0
        ? 0
        : Number(((punctualDays / totalTrackedDays) * 100).toFixed(2));

    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      employeeId,
    );

    return {
      employeeId: employee.id,
      fromDate: normalizeDateOnly(fromDate).toISOString().slice(0, 10),
      toDate: normalizeDateOnly(toDate).toISOString().slice(0, 10),
      totalTrackedDays,
      lateDays,
      earlyDepartureDays,
      absentDays,
      punctualityRate,
      averageMinutesLate,
    };
  }

  async createAlert(dto: CreatePunctualityAlertDto) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      dto.employeeId,
    );
    const trend = await this.trends(employee.id, dto.fromDate, dto.toDate);
    const thresholdLateDays = dto.thresholdLateDays ?? 3;
    const thresholdAverageLateMinutes = dto.thresholdAverageLateMinutes ?? 20;

    if (
      trend.lateDays < thresholdLateDays &&
      trend.averageMinutesLate < thresholdAverageLateMinutes
    ) {
      return {
        employeeId: employee.id,
        fromDate: trend.fromDate,
        toDate: trend.toDate,
        thresholdLateDays,
        thresholdAverageLateMinutes,
        lateDays: trend.lateDays,
        averageMinutesLate: trend.averageMinutesLate,
        alertCreated: false,
        notificationId: null,
      };
    }

    const notifyUserId =
      dto.notifyUserId ??
      (
        await this.prisma.employee.findUnique({
          where: { id: employee.id },
          select: { userId: true },
        })
      )?.userId;

    if (!notifyUserId) {
      throw new BadRequestException(
        'No target user could be resolved for the alert',
      );
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId: notifyUserId,
        type: 'punctuality_alert',
        priority: 'high',
        title: 'Punctuality threshold exceeded',
        body: `Late days: ${trend.lateDays}, average lateness: ${trend.averageMinutesLate} minutes between ${trend.fromDate} and ${trend.toDate}.`,
        payload: {
          employeeId: employee.id,
          fromDate: trend.fromDate,
          toDate: trend.toDate,
          lateDays: trend.lateDays,
          averageMinutesLate: trend.averageMinutesLate,
        },
      },
    });

    return {
      employeeId: employee.id,
      fromDate: trend.fromDate,
      toDate: trend.toDate,
      thresholdLateDays,
      thresholdAverageLateMinutes,
      lateDays: trend.lateDays,
      averageMinutesLate: trend.averageMinutesLate,
      alertCreated: true,
      notificationId: notification.id,
    };
  }
}
