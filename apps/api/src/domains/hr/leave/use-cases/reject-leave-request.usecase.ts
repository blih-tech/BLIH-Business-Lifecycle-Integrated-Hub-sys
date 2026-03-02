import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { RejectLeaveRequestDto } from '@repo/types';
import type { Request } from 'express';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { AuthPrincipal } from '../../../../shared/interfaces/auth-principal.interface';
import { mapLeaveRequestResponse } from '../leave-request.mapper';

@Injectable()
export class RejectLeaveRequestUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: string,
    dto: RejectLeaveRequestDto,
    req: Request & { user?: AuthPrincipal },
  ) {
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
        'Only pending leave requests can be rejected',
      );
    }

    const requestDays = Number(existing.daysRequested);
    const year = existing.startDate.getUTCFullYear();

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.leaveBalance.update({
        where: {
          userId_leaveType_year: {
            userId: existing.userId,
            leaveType: existing.leaveType,
            year,
          },
        },
        data: {
          pendingDays: { decrement: requestDays },
        },
      });

      await tx.leaveApproval.create({
        data: {
          leaveRequestId: existing.id,
          approverId,
          level: 1,
          decision: 'REJECTED',
          comments: dto.rejectionReason,
          decidedAt: new Date(),
        },
      });

      return tx.leaveRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectionReason: dto.rejectionReason,
          approvedById: null,
          approvedAt: null,
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
