import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../employees/employee-subject.utils';
import {
  enumerateDateRange,
  formatDateOnly,
  getDayOfWeek,
  normalizeDateOnly,
} from './attendance-date.util';

type ResolvedScheduleDay = {
  dayOfWeek: string;
  isWorkingDay: boolean;
  startMinute: number | null;
  endMinute: number | null;
  expectedMinutes: number | null;
  remoteAllowed: boolean;
};

type ResolvedSchedule = {
  id: string | null;
  name: string;
  lateThresholdMinutes: number;
  standardMinutesPerDay: number;
  day: ResolvedScheduleDay | null;
};

export type AttendanceCalendarContext = {
  employeeId: string;
  lifecycleStatus: string | null;
  countryId: string | null;
  date: Date;
  schedule: ResolvedSchedule;
  holiday: {
    id: string;
    name: string;
    isRecurringAnnual: boolean;
  } | null;
  approvedLeave: {
    id: string;
    leaveType: string;
    startHalfDay: boolean;
    endHalfDay: boolean;
  } | null;
  approvedFlexRequest: {
    id: string;
    requestType: string;
    requestedStartMinute: number | null;
    requestedEndMinute: number | null;
  } | null;
};

@Injectable()
export class AttendanceCalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async getCalendarContext(
    employeeIdOrUserIdOrKeycloakId: string,
    value: Date,
  ): Promise<AttendanceCalendarContext> {
    const date = normalizeDateOnly(value);
    const subject = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      employeeIdOrUserIdOrKeycloakId,
    );
    const employee = await this.prisma.employee.findUnique({
      where: { id: subject.id },
      select: {
        id: true,
        lifecycle: { select: { status: true } },
        profile: { select: { countryId: true } },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const [schedule, holiday, approvedLeave, approvedFlexRequest] =
      await Promise.all([
        this.resolveSchedule(employee.id, date),
        this.resolveHoliday(employee.profile?.countryId ?? null, date),
        this.prisma.leaveRequest.findFirst({
          where: {
            employeeId: employee.id,
            status: 'APPROVED',
            startDate: { lte: date },
            endDate: { gte: date },
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            leaveType: true,
            startHalfDay: true,
            endHalfDay: true,
          },
        }),
        this.prisma.flexWorkRequest.findFirst({
          where: {
            employeeId: employee.id,
            status: 'APPROVED',
            startDate: { lte: date },
            endDate: { gte: date },
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            requestType: true,
            requestedStartMinute: true,
            requestedEndMinute: true,
          },
        }),
      ]);

    const adjustedSchedule =
      approvedFlexRequest?.requestType === 'FLEX_TIME'
        ? this.applyFlexScheduleOverride(schedule, approvedFlexRequest)
        : schedule;

    return {
      employeeId: employee.id,
      lifecycleStatus: employee.lifecycle?.status ?? null,
      countryId: employee.profile?.countryId ?? null,
      date,
      schedule: adjustedSchedule,
      holiday,
      approvedLeave,
      approvedFlexRequest,
    };
  }

  async getWorkingDatesForUser(
    employeeIdOrUserIdOrKeycloakId: string,
    start: Date,
    end: Date,
  ) {
    const result: Date[] = [];

    for (const date of enumerateDateRange(start, end)) {
      const context = await this.getCalendarContext(
        employeeIdOrUserIdOrKeycloakId,
        date,
      );
      if (this.isWorkingDay(context)) {
        result.push(date);
      }
    }

    return result;
  }

  isWorkingDay(context: AttendanceCalendarContext) {
    return Boolean(context.schedule.day?.isWorkingDay) && !context.holiday;
  }

  private async resolveSchedule(employeeId: string, date: Date) {
    const assignment = await this.prisma.userWorkSchedule.findFirst({
      where: {
        employeeId,
        effectiveFrom: { lte: date },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: date } }],
      },
      orderBy: { effectiveFrom: 'desc' },
      include: {
        schedule: {
          include: {
            days: true,
          },
        },
      },
    });

    const fallbackSchedule =
      assignment?.schedule ??
      (await this.prisma.workSchedule.findFirst({
        where: { isDefault: true },
        include: { days: true },
      }));

    if (!fallbackSchedule) {
      return this.buildBuiltInSchedule(date);
    }

    const dayOfWeek = getDayOfWeek(date);
    const day =
      fallbackSchedule.days.find((entry) => entry.dayOfWeek === dayOfWeek) ??
      null;

    return {
      id: fallbackSchedule.id,
      name: fallbackSchedule.name,
      lateThresholdMinutes: fallbackSchedule.lateThresholdMinutes,
      standardMinutesPerDay: fallbackSchedule.standardMinutesPerDay,
      day: day
        ? {
            dayOfWeek: day.dayOfWeek,
            isWorkingDay: day.isWorkingDay,
            startMinute: day.startMinute,
            endMinute: day.endMinute,
            expectedMinutes: day.expectedMinutes,
            remoteAllowed: day.remoteAllowed,
          }
        : null,
    };
  }

  private async resolveHoliday(countryId: string | null, date: Date) {
    const exact = await this.prisma.holiday.findFirst({
      where: {
        date,
        OR: countryId
          ? [{ countryId }, { countryId: null }]
          : [{ countryId: null }],
      },
      orderBy: [{ countryId: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        name: true,
        isRecurringAnnual: true,
      },
    });

    if (exact) {
      return exact;
    }

    const recurring = await this.prisma.holiday.findMany({
      where: {
        isRecurringAnnual: true,
        OR: countryId
          ? [{ countryId }, { countryId: null }]
          : [{ countryId: null }],
      },
      select: {
        id: true,
        name: true,
        date: true,
        isRecurringAnnual: true,
      },
    });

    const match = recurring.find(
      (holiday) =>
        formatDateOnly(holiday.date).slice(5) === formatDateOnly(date).slice(5),
    );

    return match
      ? {
          id: match.id,
          name: match.name,
          isRecurringAnnual: match.isRecurringAnnual,
        }
      : null;
  }

  private buildBuiltInSchedule(date: Date): ResolvedSchedule {
    const dayOfWeek = getDayOfWeek(date);
    const isWeekend = dayOfWeek === 'SATURDAY' || dayOfWeek === 'SUNDAY';

    return {
      id: null,
      name: 'Default Weekday Schedule',
      lateThresholdMinutes: 15,
      standardMinutesPerDay: 480,
      day: {
        dayOfWeek,
        isWorkingDay: !isWeekend,
        startMinute: isWeekend ? null : 9 * 60,
        endMinute: isWeekend ? null : 17 * 60,
        expectedMinutes: isWeekend ? null : 480,
        remoteAllowed: true,
      },
    };
  }

  private applyFlexScheduleOverride(
    schedule: ResolvedSchedule,
    approvedFlexRequest: {
      requestedStartMinute: number | null;
      requestedEndMinute: number | null;
    },
  ): ResolvedSchedule {
    if (!schedule.day) {
      return schedule;
    }

    return {
      ...schedule,
      day: {
        ...schedule.day,
        startMinute:
          approvedFlexRequest.requestedStartMinute ?? schedule.day.startMinute,
        endMinute:
          approvedFlexRequest.requestedEndMinute ?? schedule.day.endMinute,
      },
    };
  }
}
