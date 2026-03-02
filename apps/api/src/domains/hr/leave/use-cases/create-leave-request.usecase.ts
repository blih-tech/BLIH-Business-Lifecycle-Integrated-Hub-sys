import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreateLeaveRequestDto } from '@repo/types';
import { AttendanceCalendarService } from '../../attendance/attendance-calendar.service';
import { normalizeDateOnly } from '../../attendance/attendance-date.util';
import { HrUserLifecycleService } from '../../hr-user-lifecycle.service';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapLeaveRequestResponse } from '../leave-request.mapper';
import { LeaveBalanceService } from '../leave-balance.service';
import { roundDays } from '../leave-entitlement';

@Injectable()
export class CreateLeaveRequestUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lifecycle: HrUserLifecycleService,
    private readonly calendar: AttendanceCalendarService,
    private readonly leaveBalance: LeaveBalanceService,
  ) {}

  async execute(dto: CreateLeaveRequestDto) {
    const user = await this.lifecycle.getUserForLeave(dto.userId);
    const startDate = normalizeDateOnly(dto.startDate);
    const endDate = normalizeDateOnly(dto.endDate);

    if (endDate.getTime() < startDate.getTime()) {
      throw new BadRequestException('endDate must be on or after startDate');
    }
    if (startDate.getUTCFullYear() !== endDate.getUTCFullYear()) {
      throw new BadRequestException(
        'Leave requests must stay within a single calendar year',
      );
    }
    if (
      dto.startHalfDay &&
      dto.endHalfDay &&
      startDate.getTime() === endDate.getTime()
    ) {
      throw new BadRequestException(
        'A single-day leave request can only use one half-day flag',
      );
    }

    const daysRequested = await this.calculateDaysRequested(
      dto.userId,
      startDate,
      endDate,
      dto.startHalfDay ?? false,
      dto.endHalfDay ?? false,
    );

    if (roundDays(Number(dto.daysRequested)) !== daysRequested) {
      throw new BadRequestException(
        `daysRequested must match the computed working leave days (${daysRequested})`,
      );
    }

    if (daysRequested >= 5 && !dto.handoverDelegateId) {
      throw new BadRequestException(
        'Leave of 5 or more days requires a handover delegate',
      );
    }
    if (dto.handoverDelegateId === dto.userId) {
      throw new BadRequestException(
        'handoverDelegateId cannot be the same as the requesting user',
      );
    }
    if (dto.handoverDelegateId) {
      const delegate = await this.prisma.user.findUnique({
        where: { id: dto.handoverDelegateId },
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
        userId: dto.userId,
        status: { in: ['PENDING', 'APPROVED'] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      select: { id: true },
    });
    if (overlapping) {
      throw new BadRequestException(
        'Overlapping leave request exists for this period',
      );
    }

    const year = startDate.getUTCFullYear();
    const employmentType = user.employment?.employmentType ?? 'FULL_TIME';
    const balance = await this.leaveBalance.ensureBalance({
      userId: dto.userId,
      leaveType: dto.leaveType,
      year,
      employmentType,
    });
    if (dto.submit) {
      this.leaveBalance.assertAvailability(balance, daysRequested);
    }

    const count = await this.prisma.leaveRequest.count({
      where: {
        createdAt: {
          gte: new Date(Date.UTC(year, 0, 1)),
          lt: new Date(Date.UTC(year + 1, 0, 1)),
        },
      },
    });
    const requestId = `LV-${year}-${String(count + 1).padStart(4, '0')}`;
    const submittedAt = dto.submit ? new Date() : null;
    const status = dto.submit ? 'PENDING' : 'DRAFT';
    const balanceSnapshot = {
      year,
      leaveType: dto.leaveType,
      totalDays: balance.totalDays,
      carriedOver: balance.carriedOver,
      used: balance.usedDays,
      pending: balance.pendingDays,
      available: balance.availableDays,
      requested: daysRequested,
    };

    const created = await this.prisma.$transaction(async (tx) => {
      if (dto.submit) {
        await tx.leaveBalance.update({
          where: {
            userId_leaveType_year: {
              userId: dto.userId,
              leaveType: dto.leaveType as never,
              year,
            },
          },
          data: {
            pendingDays: { increment: daysRequested },
          },
        });
      }

      return tx.leaveRequest.create({
        data: {
          requestId,
          userId: dto.userId,
          leaveType: dto.leaveType as never,
          startDate,
          endDate,
          daysRequested,
          startHalfDay: dto.startHalfDay ?? false,
          endHalfDay: dto.endHalfDay ?? false,
          reason: dto.reason ?? undefined,
          description: dto.description ?? undefined,
          contactDuringLeave: (dto.contactDuringLeave ?? undefined) as
            | object
            | undefined,
          handoverDelegateId: dto.handoverDelegateId ?? undefined,
          handoverNotes: dto.handoverNotes ?? undefined,
          balanceSnapshot: balanceSnapshot as object,
          submittedAt,
          status,
        },
        include: {
          approvalSteps: {
            orderBy: { level: 'asc' },
          },
        },
      });
    });

    return mapLeaveRequestResponse(created);
  }

  private async calculateDaysRequested(
    userId: string,
    startDate: Date,
    endDate: Date,
    startHalfDay: boolean,
    endHalfDay: boolean,
  ) {
    const workingDates = await this.calendar.getWorkingDatesForUser(
      userId,
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
