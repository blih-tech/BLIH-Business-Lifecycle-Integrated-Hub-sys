import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AttendanceReconciliationService } from '../../attendance/attendance-reconciliation.service';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { AuthPrincipal } from '../../../../shared/interfaces/auth-principal.interface';
import { mapLeaveRequestResponse } from '../leave-request.mapper';

@Injectable()
export class ApproveLeaveRequestUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reconciliation: AttendanceReconciliationService,
  ) {}

  async execute(id: string, req: Request & { user?: AuthPrincipal }) {
    const approverId =
      (req.user as AuthPrincipal)?.userId ?? (req.user as AuthPrincipal)?.sub;
    if (!approverId) {
      throw new BadRequestException('Approver user id required');
    }

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
    if (existing.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending leave requests can be approved',
      );
    }

    const requestDays = Number(existing.daysRequested);
    const year = existing.startDate.getUTCFullYear();

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
          pendingDays: { decrement: requestDays },
          usedDays: { increment: requestDays },
        },
      });

      await tx.leaveApproval.create({
        data: {
          leaveRequestId: existing.id,
          approverId,
          level: 1,
          decision: 'APPROVED',
          decidedAt: new Date(),
        },
      });

      return tx.leaveRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedById: approverId,
          approvedAt: new Date(),
          rejectionReason: null,
        },
        include: {
          approvalSteps: {
            orderBy: { level: 'asc' },
          },
        },
      });
    });

    await this.reconciliation.reconcileRangeForUser(
      updated.employeeId,
      updated.startDate,
      updated.endDate,
    );

    return mapLeaveRequestResponse(updated);
  }
}
