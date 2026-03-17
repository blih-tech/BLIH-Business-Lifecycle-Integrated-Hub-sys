import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { UpdateLeaveRequestDto } from '@repo/types';
import { AttendanceCalendarService } from '../../attendance/attendance-calendar.service';
import { normalizeDateOnly } from '../../attendance/attendance-date.util';
import { HrUserLifecycleService } from '../../hr-user-lifecycle.service';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapLeaveRequestResponse } from '../leave-request.mapper';
import { LeaveBalanceService } from '../leave-balance.service';
import { roundDays } from '../leave-entitlement';

@Injectable()
export class UpdateLeaveRequestUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lifecycle: HrUserLifecycleService,
    private readonly calendar: AttendanceCalendarService,
    private readonly leaveBalance: LeaveBalanceService,
  ) {}

  async execute(id: string, dto: UpdateLeaveRequestDto) {
    const existing = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        approvalSteps: {
          orderBy: { level: 'asc' },
        },
      },
    });
    if (!existing) {
      throw new NotFoundException('Leave request not found');
    }
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException('Only draft leave requests can be updated');
    }

    const employee = await this.lifecycle.getUserForLeave(existing.employeeId);
    const startDate =
      dto.startDate !== undefined
        ? normalizeDateOnly(dto.startDate)
        : existing.startDate;
    const endDate =
      dto.endDate !== undefined
        ? normalizeDateOnly(dto.endDate)
        : existing.endDate;

    if (endDate.getTime() < startDate.getTime()) {
      throw new BadRequestException('endDate must be on or after startDate');
    }
    if (startDate.getUTCFullYear() !== endDate.getUTCFullYear()) {
      throw new BadRequestException(
        'Leave requests must stay within a single calendar year',
      );
    }

    const daysRequested = await this.calculateDaysRequested(
      employee.id,
      startDate,
      endDate,
      existing.startHalfDay,
      existing.endHalfDay,
    );

    if (
      dto.daysRequested !== undefined &&
      roundDays(Number(dto.daysRequested)) !== daysRequested
    ) {
      throw new BadRequestException(
        `daysRequested must match the computed working leave days (${daysRequested})`,
      );
    }

    const handoverDelegateId =
      dto.handoverDelegateId !== undefined
        ? dto.handoverDelegateId
        : existing.handoverDelegateId;
    if (daysRequested >= 5 && !handoverDelegateId) {
      throw new BadRequestException(
        'Leave of 5 or more days requires a handover delegate',
      );
    }
    if (handoverDelegateId && handoverDelegateId === employee.userId) {
      throw new BadRequestException(
        'handoverDelegateId cannot be the same as the requesting user',
      );
    }
    if (handoverDelegateId) {
      const delegate = await this.prisma.user.findUnique({
        where: { id: handoverDelegateId },
        select: { id: true },
      });
      if (!delegate) {
        throw new BadRequestException(
          'handoverDelegateId does not match a user',
        );
      }
    }

    const overlapping = await this.prisma.leaveRequest.findFirst({
      where: {
        employeeId: employee.id,
        status: { in: ['PENDING', 'APPROVED'] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
        NOT: { id: existing.id },
      },
      select: { id: true },
    });
    if (overlapping) {
      throw new BadRequestException(
        'Overlapping leave request exists for this period',
      );
    }

    const year = startDate.getUTCFullYear();
    const employmentType = employee.employment?.employmentType ?? 'FULL_TIME';
    const balance = await this.leaveBalance.ensureBalance({
      employeeId: employee.id,
      leaveType: existing.leaveType,
      year,
      employmentType,
    });

    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: {
        ...(dto.startDate !== undefined ? { startDate } : {}),
        ...(dto.endDate !== undefined ? { endDate } : {}),
        daysRequested,
        ...(dto.reason !== undefined ? { reason: dto.reason } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.contactDuringLeave !== undefined
          ? {
              contactDuringLeave: (dto.contactDuringLeave ?? null) as never,
            }
          : {}),
        ...(dto.handoverDelegateId !== undefined
          ? { handoverDelegateId: dto.handoverDelegateId }
          : {}),
        ...(dto.handoverNotes !== undefined
          ? { handoverNotes: dto.handoverNotes }
          : {}),
        balanceSnapshot: {
          year,
          leaveType: existing.leaveType,
          totalDays: balance.totalDays,
          carriedOver: balance.carriedOver,
          used: balance.usedDays,
          pending: balance.pendingDays,
          available: balance.availableDays,
          requested: daysRequested,
        } as never,
      },
      include: {
        approvalSteps: {
          orderBy: { level: 'asc' },
        },
      },
    });

    return mapLeaveRequestResponse(updated);
  }

  private async calculateDaysRequested(
    employeeId: string,
    startDate: Date,
    endDate: Date,
    startHalfDay: boolean,
    endHalfDay: boolean,
  ) {
    const workingDates = await this.calendar.getWorkingDatesForUser(
      employeeId,
      startDate,
      endDate,
    );
    if (workingDates.length === 0) {
      throw new BadRequestException(
        'The selected date range does not contain any working days',
      );
    }

    let daysRequested = workingDates.length;
    if (startHalfDay) {
      daysRequested -= 0.5;
    }
    if (endHalfDay) {
      daysRequested -= 0.5;
    }
    daysRequested = roundDays(daysRequested);

    if (daysRequested <= 0) {
      throw new BadRequestException('daysRequested must be positive');
    }

    return daysRequested;
  }
}
