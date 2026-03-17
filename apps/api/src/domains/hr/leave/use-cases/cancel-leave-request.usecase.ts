import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceReconciliationService } from '../../attendance/attendance-reconciliation.service';
import { normalizeDateOnly } from '../../attendance/attendance-date.util';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapLeaveRequestResponse } from '../leave-request.mapper';

@Injectable()
export class CancelLeaveRequestUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reconciliation: AttendanceReconciliationService,
  ) {}

  async execute(id: string) {
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
    if (!['DRAFT', 'PENDING', 'APPROVED'].includes(existing.status)) {
      throw new BadRequestException(
        'Only active leave requests can be cancelled',
      );
    }

    if (
      existing.status === 'APPROVED' &&
      normalizeDateOnly(new Date()).getTime() >= existing.startDate.getTime()
    ) {
      throw new BadRequestException(
        'Approved leave can only be cancelled before the leave start date',
      );
    }

    const requestDays = Number(existing.daysRequested);
    const year = existing.startDate.getUTCFullYear();

    const updated = await this.prisma.$transaction(async (tx) => {
      if (existing.status === 'PENDING') {
        const balance = await tx.leaveBalance.findUnique({
          where: {
            employeeId_leaveType_year: {
              employeeId: existing.employeeId,
              leaveType: existing.leaveType,
              year,
            },
          },
        });
        if (balance) {
          const pendingDays = Number(balance.pendingDays);
          await tx.leaveBalance.update({
            where: {
              employeeId_leaveType_year: {
                employeeId: existing.employeeId,
                leaveType: existing.leaveType,
                year,
              },
            },
            data: {
              pendingDays: {
                decrement: Math.min(pendingDays, requestDays),
              },
            },
          });
        }
      }

      if (existing.status === 'APPROVED') {
        await tx.leaveBalance.update({
          where: {
            employeeId_leaveType_year: {
              employeeId: existing.employeeId,
              leaveType: existing.leaveType,
              year,
            },
          },
          data: {
            usedDays: { decrement: requestDays },
          },
        });
      }

      return tx.leaveRequest.update({
        where: { id },
        data: {
          status: 'CANCELLED',
        },
        include: {
          approvalSteps: {
            orderBy: { level: 'asc' },
          },
        },
      });
    });

    if (existing.status === 'APPROVED') {
      await this.reconciliation.reconcileRangeForUser(
        updated.employeeId,
        updated.startDate,
        updated.endDate,
      );
    }

    return mapLeaveRequestResponse(updated);
  }
}
