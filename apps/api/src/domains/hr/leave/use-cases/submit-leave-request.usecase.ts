import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceCalendarService } from '../../attendance/attendance-calendar.service';
import { HrUserLifecycleService } from '../../hr-user-lifecycle.service';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapLeaveRequestResponse } from '../leave-request.mapper';
import { LeaveBalanceService } from '../leave-balance.service';
import { roundDays } from '../leave-entitlement';

@Injectable()
export class SubmitLeaveRequestUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lifecycle: HrUserLifecycleService,
    private readonly calendar: AttendanceCalendarService,
    private readonly leaveBalance: LeaveBalanceService,
  ) {}

  async execute(id: string) {
    const existing = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { approvalSteps: { orderBy: { level: 'asc' } } },
    });
    if (!existing) {
      throw new NotFoundException('Leave request not found');
    }
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only draft leave requests can be submitted',
      );
    }

    const employee = await this.lifecycle.getUserForLeave(existing.employeeId);
    const employmentType = employee.employment?.employmentType ?? 'FULL_TIME';
    const year = existing.startDate.getUTCFullYear();

    if (
      existing.startDate.getUTCFullYear() !== existing.endDate.getUTCFullYear()
    ) {
      throw new BadRequestException(
        'Leave requests must stay within a single calendar year',
      );
    }

    const overlapping = await this.prisma.leaveRequest.findFirst({
      where: {
        employeeId: existing.employeeId,
        status: { in: ['PENDING', 'APPROVED'] },
        id: { not: existing.id },
        startDate: { lte: existing.endDate },
        endDate: { gte: existing.startDate },
      },
      select: { id: true },
    });
    if (overlapping) {
      throw new BadRequestException(
        'Overlapping leave request exists for this period',
      );
    }

    const workingDates = await this.calendar.getWorkingDatesForUser(
      existing.employeeId,
      existing.startDate,
      existing.endDate,
    );
    if (workingDates.length === 0) {
      throw new BadRequestException(
        'The selected date range does not contain any working days',
      );
    }

    const calculatedDays = roundDays(
      workingDates.length -
        (existing.startHalfDay ? 0.5 : 0) -
        (existing.endHalfDay ? 0.5 : 0),
    );
    const requestDays = roundDays(Number(existing.daysRequested));
    if (calculatedDays !== requestDays) {
      throw new BadRequestException(
        `The stored daysRequested value (${requestDays}) no longer matches the current working schedule (${calculatedDays})`,
      );
    }
    if (requestDays >= 5 && !existing.handoverDelegateId) {
      throw new BadRequestException(
        'Leave of 5 or more days requires a handover delegate',
      );
    }

    const balance = await this.leaveBalance.ensureBalance({
      employeeId: existing.employeeId,
      leaveType: existing.leaveType,
      year,
      employmentType,
    });
    this.leaveBalance.assertAvailability(balance, requestDays);

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.leaveBalance.update({
        where: {
          employeeId_leaveType_year: {
            employeeId: existing.employeeId,
            leaveType: existing.leaveType,
            year,
          },
        },
        data: {
          pendingDays: { increment: requestDays },
        },
      });

      return tx.leaveRequest.update({
        where: { id },
        data: {
          status: 'PENDING',
          submittedAt: new Date(),
          balanceSnapshot: {
            year,
            leaveType: existing.leaveType,
            totalDays: balance.totalDays,
            carriedOver: balance.carriedOver,
            used: balance.usedDays,
            pending: balance.pendingDays,
            available: balance.availableDays,
            requested: requestDays,
          } as object,
        },
        include: {
          approvalSteps: {
            orderBy: { level: 'asc' },
          },
        },
      });
    });

    return mapLeaveRequestResponse(updated);
  }
}
