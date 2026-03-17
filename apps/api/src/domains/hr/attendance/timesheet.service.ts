import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateTimesheetDto,
  RejectTimesheetDto,
  UpdateTimesheetDto,
} from '@repo/types';
import type { Request } from 'express';
import type { PrismaClient } from '../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import type { AuthPrincipal } from '../../../shared/interfaces/auth-principal.interface';
import { HrUserLifecycleService } from '../hr-user-lifecycle.service';
import { normalizeDateOnly } from './attendance-date.util';
import { summarizeAttendanceLogs } from './attendance-reporting.utils';
import { mapTimesheetResponse } from './timesheet.mapper';
import { buildRequestId, validateDateRange } from './time-request.utils';
import { AttendanceReconciliationService } from './attendance-reconciliation.service';

@Injectable()
export class TimesheetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lifecycle: HrUserLifecycleService,
    private readonly reconciliation: AttendanceReconciliationService,
  ) {}

  private get db(): PrismaClient {
    return this.prisma as unknown as PrismaClient;
  }

  async create(dto: CreateTimesheetDto) {
    const employee = await this.lifecycle.assertAttendanceAllowed(
      dto.employeeId,
    );
    const periodStart = normalizeDateOnly(dto.periodStart);
    const periodEnd = normalizeDateOnly(dto.periodEnd);
    validateDateRange(periodStart, periodEnd, 31);

    await this.ensureUniquePeriod(employee.id, periodStart, periodEnd);
    const summary = await this.buildSummary(
      employee.id,
      periodStart,
      periodEnd,
    );

    const year = periodStart.getUTCFullYear();
    const count = await this.db.timesheet.count({
      where: {
        createdAt: {
          gte: new Date(Date.UTC(year, 0, 1)),
          lt: new Date(Date.UTC(year + 1, 0, 1)),
        },
      },
    });

    const created = await this.db.timesheet.create({
      data: {
        timesheetId: buildRequestId('TIM', year, count + 1),
        employeeId: employee.id,
        periodStart,
        periodEnd,
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
        sourceSnapshot: summary.dailyEntries,
        notes: dto.notes ?? undefined,
        status: dto.submit ? 'PENDING' : 'DRAFT',
        submittedAt: dto.submit ? new Date() : null,
      },
    });

    return mapTimesheetResponse(created);
  }

  async list(filters: {
    employeeId?: string;
    status?: string;
    periodStart?: string;
    periodEnd?: string;
  }) {
    const employeeId = filters.employeeId
      ? (await this.lifecycle.assertAttendanceAllowed(filters.employeeId)).id
      : undefined;
    const periodStart = filters.periodStart
      ? normalizeDateOnly(filters.periodStart)
      : undefined;
    const periodEnd = filters.periodEnd
      ? normalizeDateOnly(filters.periodEnd)
      : undefined;

    const rows = await this.db.timesheet.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        ...(filters.status ? { status: filters.status as never } : {}),
        ...(periodStart || periodEnd
          ? {
              AND: [
                periodStart ? { periodEnd: { gte: periodStart } } : {},
                periodEnd ? { periodStart: { lte: periodEnd } } : {},
              ],
            }
          : {}),
      },
      orderBy: [{ periodStart: 'desc' }, { createdAt: 'desc' }],
    });

    return rows.map(mapTimesheetResponse);
  }

  async get(id: string) {
    const row = await this.db.timesheet.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('Timesheet not found');
    }
    return mapTimesheetResponse(row);
  }

  async update(id: string, dto: UpdateTimesheetDto) {
    const existing = await this.db.timesheet.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Timesheet not found');
    }
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException('Only draft timesheets can be updated');
    }

    const periodStart =
      dto.periodStart !== undefined
        ? normalizeDateOnly(dto.periodStart)
        : existing.periodStart;
    const periodEnd =
      dto.periodEnd !== undefined
        ? normalizeDateOnly(dto.periodEnd)
        : existing.periodEnd;
    validateDateRange(periodStart, periodEnd, 31);

    await this.ensureUniquePeriod(
      existing.employeeId,
      periodStart,
      periodEnd,
      id,
    );
    const summary = await this.buildSummary(
      existing.employeeId,
      periodStart,
      periodEnd,
    );

    const updated = await this.db.timesheet.update({
      where: { id },
      data: {
        periodStart,
        periodEnd,
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
        sourceSnapshot: summary.dailyEntries,
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
    });

    return mapTimesheetResponse(updated);
  }

  async submit(id: string) {
    const existing = await this.db.timesheet.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Timesheet not found');
    }
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException('Only draft timesheets can be submitted');
    }

    const updated = await this.db.timesheet.update({
      where: { id },
      data: {
        status: 'PENDING',
        submittedAt: existing.submittedAt ?? new Date(),
        approvedById: null,
        approvedAt: null,
        rejectionReason: null,
      },
    });

    return mapTimesheetResponse(updated);
  }

  async cancel(id: string) {
    const existing = await this.db.timesheet.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Timesheet not found');
    }
    if (!['DRAFT', 'PENDING'].includes(existing.status)) {
      throw new BadRequestException(
        'Only draft or pending timesheets can be cancelled',
      );
    }

    const updated = await this.db.timesheet.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return mapTimesheetResponse(updated);
  }

  async approve(id: string, req: Request & { user?: AuthPrincipal }) {
    const approverId =
      (req.user as AuthPrincipal)?.userId ?? (req.user as AuthPrincipal)?.sub;
    if (!approverId) {
      throw new BadRequestException('Approver user id required');
    }

    const existing = await this.db.timesheet.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Timesheet not found');
    }
    if (existing.status !== 'PENDING') {
      throw new BadRequestException('Only pending timesheets can be approved');
    }

    const updated = await this.db.timesheet.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: approverId,
        approvedAt: new Date(),
        rejectionReason: null,
      },
    });

    return mapTimesheetResponse(updated);
  }

  async reject(
    id: string,
    body: RejectTimesheetDto,
    req: Request & { user?: AuthPrincipal },
  ) {
    const approverId =
      (req.user as AuthPrincipal)?.userId ?? (req.user as AuthPrincipal)?.sub;
    if (!approverId) {
      throw new BadRequestException('Approver user id required');
    }

    const existing = await this.db.timesheet.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Timesheet not found');
    }
    if (existing.status !== 'PENDING') {
      throw new BadRequestException('Only pending timesheets can be rejected');
    }

    const updated = await this.db.timesheet.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedById: approverId,
        approvedAt: new Date(),
        rejectionReason: body.rejectionReason.trim(),
      },
    });

    return mapTimesheetResponse(updated);
  }

  private async buildSummary(
    employeeId: string,
    periodStart: Date,
    periodEnd: Date,
  ) {
    await this.reconciliation.reconcileRangeForUser(
      employeeId,
      periodStart,
      periodEnd,
    );

    const logs = await this.prisma.attendanceLog.findMany({
      where: {
        employeeId,
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        status: true,
        totalMinutes: true,
        overtimeMinutes: true,
        overtimeApproved: true,
        checkInAt: true,
        checkOutAt: true,
        notes: true,
      },
    });

    return summarizeAttendanceLogs(logs);
  }

  private async ensureUniquePeriod(
    employeeId: string,
    periodStart: Date,
    periodEnd: Date,
    ignoreId?: string,
  ) {
    const existing = await this.db.timesheet.findFirst({
      where: {
        employeeId,
        periodStart,
        periodEnd,
        ...(ignoreId ? { id: { not: ignoreId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException(
        'A timesheet already exists for this employee and period',
      );
    }
  }
}
