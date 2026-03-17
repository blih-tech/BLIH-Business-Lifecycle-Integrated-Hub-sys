import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  AttendanceAnalyticsResponseDto,
  AttendanceComplianceReportResponseDto,
  EmployeeAttendanceAnalyticsDto,
  LeaveAnalyticsResponseDto,
  MonthlyAttendanceReportResponseDto,
} from '@repo/types';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../employees/employee-subject.utils';
import { formatDateOnly, normalizeDateOnly } from './attendance-date.util';
import {
  aggregateAttendanceSummaries,
  emptyAttendanceSummary,
  summarizeAttendanceLogs,
} from './attendance-reporting.utils';

function employeeName(
  user: { firstName: string; lastName: string } | null | undefined,
) {
  if (!user) {
    return null;
  }

  return `${user.firstName} ${user.lastName}`.trim();
}

@Injectable()
export class AttendanceReportingService {
  constructor(private readonly prisma: PrismaService) {}

  async attendanceAnalytics(
    fromDate: string,
    toDate: string,
    employeeId?: string,
  ): Promise<AttendanceAnalyticsResponseDto> {
    const filters = await this.resolveRangeFilters(
      fromDate,
      toDate,
      employeeId,
    );
    const employees = await this.loadEmployeeAttendanceSummaries(filters);

    return {
      rangeStart: formatDateOnly(filters.start),
      rangeEnd: formatDateOnly(filters.end),
      employeeId: filters.employeeId ?? null,
      employeeCount: employees.length,
      totals: aggregateAttendanceSummaries(
        employees.map(({ summary }) => ({
          ...summary,
          dailyEntries: [],
        })),
      ),
      employees: employees.map(({ employeeId: id, name, summary }) =>
        this.toEmployeeAnalytics(id, name, summary),
      ),
    };
  }

  async leaveAnalytics(
    fromDate: string,
    toDate: string,
    employeeId?: string,
  ): Promise<LeaveAnalyticsResponseDto> {
    const filters = await this.resolveRangeFilters(
      fromDate,
      toDate,
      employeeId,
    );
    const requests = await this.prisma.leaveRequest.findMany({
      where: {
        ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
        startDate: { lte: filters.end },
        endDate: { gte: filters.start },
      },
      select: {
        leaveType: true,
        status: true,
        daysRequested: true,
      },
    });

    const typeMap = new Map<
      string,
      {
        leaveType: string;
        totalRequests: number;
        approvedRequests: number;
        pendingRequests: number;
        approvedDays: number;
        pendingDays: number;
      }
    >();

    let approvedRequests = 0;
    let rejectedRequests = 0;
    let pendingRequests = 0;
    let cancelledRequests = 0;
    let approvedDays = 0;
    let pendingDays = 0;

    for (const request of requests) {
      const key = request.leaveType;
      const entry = typeMap.get(key) ?? {
        leaveType: key,
        totalRequests: 0,
        approvedRequests: 0,
        pendingRequests: 0,
        approvedDays: 0,
        pendingDays: 0,
      };
      const days = Number(request.daysRequested);

      entry.totalRequests += 1;
      if (request.status === 'APPROVED') {
        entry.approvedRequests += 1;
        entry.approvedDays += days;
        approvedRequests += 1;
        approvedDays += days;
      }
      if (request.status === 'PENDING') {
        entry.pendingRequests += 1;
        entry.pendingDays += days;
        pendingRequests += 1;
        pendingDays += days;
      }
      if (request.status === 'REJECTED') {
        rejectedRequests += 1;
      }
      if (request.status === 'CANCELLED') {
        cancelledRequests += 1;
      }

      typeMap.set(key, entry);
    }

    return {
      rangeStart: formatDateOnly(filters.start),
      rangeEnd: formatDateOnly(filters.end),
      employeeId: filters.employeeId ?? null,
      totalRequests: requests.length,
      approvedRequests,
      rejectedRequests,
      pendingRequests,
      cancelledRequests,
      approvedDays: Math.round(approvedDays * 100) / 100,
      pendingDays: Math.round(pendingDays * 100) / 100,
      types: [...typeMap.values()].sort((left, right) =>
        left.leaveType.localeCompare(right.leaveType),
      ),
    };
  }

  async monthlyReport(
    year: number,
    month: number,
    employeeId?: string,
  ): Promise<MonthlyAttendanceReportResponseDto> {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 0));
    const filters = await this.resolveRangeFilters(
      formatDateOnly(start),
      formatDateOnly(end),
      employeeId,
    );
    const employees = await this.loadEmployeeAttendanceSummaries(filters);

    return {
      month,
      year,
      rangeStart: formatDateOnly(filters.start),
      rangeEnd: formatDateOnly(filters.end),
      employeeId: filters.employeeId ?? null,
      totals: aggregateAttendanceSummaries(
        employees.map(({ summary }) => ({
          ...summary,
          dailyEntries: [],
        })),
      ),
      employees: employees.map(({ employeeId: id, name, summary }) =>
        this.toEmployeeAnalytics(id, name, summary),
      ),
    };
  }

  async complianceReport(
    fromDate: string,
    toDate: string,
    employeeId?: string,
  ): Promise<AttendanceComplianceReportResponseDto> {
    const filters = await this.resolveRangeFilters(
      fromDate,
      toDate,
      employeeId,
    );
    const employees = await this.loadEmployeeAttendanceSummaries(filters);

    const [corrections, overtime, flexRequests, leaveRequests] =
      await Promise.all([
        this.prisma.attendanceCorrectionRequest.findMany({
          where: {
            ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
            status: 'PENDING',
            date: { gte: filters.start, lte: filters.end },
          },
          select: { employeeId: true },
        }),
        this.prisma.overtimeRequest.findMany({
          where: {
            ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
            status: 'PENDING',
            date: { gte: filters.start, lte: filters.end },
          },
          select: { employeeId: true },
        }),
        this.prisma.flexWorkRequest.findMany({
          where: {
            ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
            status: 'PENDING',
            startDate: { lte: filters.end },
            endDate: { gte: filters.start },
          },
          select: { employeeId: true },
        }),
        this.prisma.leaveRequest.findMany({
          where: {
            ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
            status: 'PENDING',
            startDate: { lte: filters.end },
            endDate: { gte: filters.start },
          },
          select: { employeeId: true },
        }),
      ]);

    const pendingCorrections = this.countByEmployee(corrections);
    const pendingOvertimeRequests = this.countByEmployee(overtime);
    const pendingFlexRequests = this.countByEmployee(flexRequests);
    const pendingLeaveRequests = this.countByEmployee(leaveRequests);

    const nameByEmployeeId = new Map(
      employees.map(({ employeeId: id, name }) => [id, name] as const),
    );
    const allEmployeeIds = new Set<string>([
      ...nameByEmployeeId.keys(),
      ...pendingCorrections.keys(),
      ...pendingOvertimeRequests.keys(),
      ...pendingFlexRequests.keys(),
      ...pendingLeaveRequests.keys(),
    ]);

    if (filters.employeeId && !nameByEmployeeId.has(filters.employeeId)) {
      const employee = await this.prisma.employee.findUnique({
        where: { id: filters.employeeId },
        select: {
          id: true,
          user: { select: { firstName: true, lastName: true } },
        },
      });
      if (employee) {
        nameByEmployeeId.set(employee.id, employeeName(employee.user));
      }
    }

    const summaryMap = new Map(
      employees.map((item) => [item.employeeId, item.summary] as const),
    );
    const thresholds = { lateCount: 3, absenceDays: 1 };

    const flaggedEmployees = [...allEmployeeIds]
      .map((id) => {
        const summary = summaryMap.get(id) ?? emptyAttendanceSummary();
        const pendingTotal =
          (pendingCorrections.get(id) ?? 0) +
          (pendingOvertimeRequests.get(id) ?? 0) +
          (pendingFlexRequests.get(id) ?? 0) +
          (pendingLeaveRequests.get(id) ?? 0);
        const complianceScore = Math.max(
          0,
          100 -
            summary.absenceDays * 20 -
            summary.lateCount * 5 -
            summary.earlyDepartureCount * 3 -
            pendingTotal * 2,
        );

        return {
          employeeId: id,
          employeeName: nameByEmployeeId.get(id) ?? null,
          absenceDays: summary.absenceDays,
          lateCount: summary.lateCount,
          earlyDepartureCount: summary.earlyDepartureCount,
          pendingCorrections: pendingCorrections.get(id) ?? 0,
          pendingOvertimeRequests: pendingOvertimeRequests.get(id) ?? 0,
          pendingFlexRequests: pendingFlexRequests.get(id) ?? 0,
          pendingLeaveRequests: pendingLeaveRequests.get(id) ?? 0,
          complianceScore: Math.round(complianceScore * 100) / 100,
        };
      })
      .filter(
        (item) =>
          item.absenceDays >= thresholds.absenceDays ||
          item.lateCount >= thresholds.lateCount ||
          item.earlyDepartureCount > 0 ||
          item.pendingCorrections > 0 ||
          item.pendingOvertimeRequests > 0 ||
          item.pendingFlexRequests > 0 ||
          item.pendingLeaveRequests > 0,
      )
      .sort((left, right) => left.complianceScore - right.complianceScore);

    return {
      rangeStart: formatDateOnly(filters.start),
      rangeEnd: formatDateOnly(filters.end),
      employeeId: filters.employeeId ?? null,
      employeeCount: allEmployeeIds.size,
      thresholds,
      flaggedEmployees,
    };
  }

  private async resolveRangeFilters(
    fromDate: string,
    toDate: string,
    employeeId?: string,
  ) {
    const start = normalizeDateOnly(fromDate);
    const end = normalizeDateOnly(toDate);
    if (end.getTime() < start.getTime()) {
      throw new BadRequestException('toDate must be on or after fromDate');
    }

    const resolvedEmployeeId = employeeId
      ? (
          await resolveEmployeeSubjectOrThrow(
            this.prisma,
            employeeId,
            'Employee not found for reporting',
          )
        ).id
      : undefined;

    return {
      start,
      end,
      employeeId: resolvedEmployeeId,
    };
  }

  private async loadEmployeeAttendanceSummaries(filters: {
    start: Date;
    end: Date;
    employeeId?: string;
  }) {
    const logs = await this.prisma.attendanceLog.findMany({
      where: {
        ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
        date: {
          gte: filters.start,
          lte: filters.end,
        },
      },
      orderBy: [{ employeeId: 'asc' }, { date: 'asc' }],
      select: {
        employeeId: true,
        date: true,
        status: true,
        totalMinutes: true,
        overtimeMinutes: true,
        overtimeApproved: true,
        checkInAt: true,
        checkOutAt: true,
        notes: true,
        employee: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    const grouped = new Map<
      string,
      {
        name: string | null;
        logs: Array<{
          date: Date;
          status: string;
          totalMinutes: number | null;
          overtimeMinutes: number | null;
          overtimeApproved: boolean;
          checkInAt: Date | null;
          checkOutAt: Date | null;
          notes: string | null;
        }>;
      }
    >();

    for (const log of logs) {
      const current = grouped.get(log.employeeId) ?? {
        name: employeeName(log.employee.user),
        logs: [],
      };

      current.logs.push({
        date: log.date,
        status: log.status,
        totalMinutes: log.totalMinutes,
        overtimeMinutes: log.overtimeMinutes,
        overtimeApproved: log.overtimeApproved,
        checkInAt: log.checkInAt,
        checkOutAt: log.checkOutAt,
        notes: log.notes,
      });

      grouped.set(log.employeeId, current);
    }

    return [...grouped.entries()].map(([employeeId, entry]) => ({
      employeeId,
      name: entry.name,
      summary: summarizeAttendanceLogs(entry.logs),
    }));
  }

  private toEmployeeAnalytics(
    employeeId: string,
    name: string | null,
    summary: ReturnType<typeof summarizeAttendanceLogs>,
  ): EmployeeAttendanceAnalyticsDto {
    return {
      employeeId,
      employeeName: name,
      trackedDays: summary.trackedDays,
      workedDays: summary.workedDays,
      leaveDays: summary.leaveDays,
      absenceDays: summary.absenceDays,
      remoteDays: summary.remoteDays,
      lateCount: summary.lateCount,
      earlyDepartureCount: summary.earlyDepartureCount,
      totalWorkedMinutes: summary.totalWorkedMinutes,
      overtimeMinutes: summary.overtimeMinutes,
      attendanceRate: summary.attendanceRate,
      punctualityRate: summary.punctualityRate,
    };
  }

  private countByEmployee(rows: Array<{ employeeId: string }>) {
    const counts = new Map<string, number>();
    for (const row of rows) {
      counts.set(row.employeeId, (counts.get(row.employeeId) ?? 0) + 1);
    }
    return counts;
  }
}
