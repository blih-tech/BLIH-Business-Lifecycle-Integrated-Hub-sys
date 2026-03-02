import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateLeaveRequestDto } from '@blih/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { getAnnualEntitlement, roundDays } from '../leave-entitlement';
import { mapLeaveRequestResponse } from '../leave-request.mapper';

@Injectable()
export class CreateLeaveRequestUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateLeaveRequestDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: {
        id: true,
        employment: { select: { employmentType: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate < startDate) {
      throw new BadRequestException('endDate must be on or after startDate');
    }
    const daysRequested = Number(dto.daysRequested);
    if (daysRequested <= 0) {
      throw new BadRequestException('daysRequested must be positive');
    }

    const employmentType = user.employment?.employmentType ?? 'FULL_TIME';
    const entitlement = getAnnualEntitlement(employmentType, dto.leaveType);
    const year = startDate.getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    const approvedSameYear = await this.prisma.leaveRequest.findMany({
      where: {
        userId: dto.userId,
        leaveType: dto.leaveType as never,
        status: 'APPROVED',
        startDate: { gte: yearStart, lte: yearEnd },
      },
      select: { daysRequested: true },
    });
    const used = approvedSameYear.reduce(
      (sum, r) => sum + Number(r.daysRequested),
      0,
    );

    const pendingSameYear = await this.prisma.leaveRequest.findMany({
      where: {
        userId: dto.userId,
        leaveType: dto.leaveType as never,
        status: 'PENDING',
        startDate: { gte: yearStart, lte: yearEnd },
      },
      select: { daysRequested: true },
    });
    const pending = pendingSameYear.reduce(
      (sum, r) => sum + Number(r.daysRequested),
      0,
    );

    const available = roundDays(Math.max(0, entitlement - used - pending));
    if (dto.leaveType !== 'UNPAID' && daysRequested > available) {
      throw new BadRequestException(
        'Insufficient leave balance. Available: ' +
          available +
          ', requested: ' +
          daysRequested,
      );
    }

    const overlapping = await this.prisma.leaveRequest.findFirst({
      where: {
        userId: dto.userId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [{ startDate: { lte: endDate }, endDate: { gte: startDate } }],
      },
    });
    if (overlapping) {
      throw new BadRequestException(
        'Overlapping leave request exists for this period',
      );
    }

    if (daysRequested >= 5 && !dto.handoverDelegateId) {
      throw new BadRequestException(
        'Leave of 5 or more days requires a handover delegate',
      );
    }

    const count = await this.prisma.leaveRequest.count({
      where: { createdAt: { gte: yearStart } },
    });
    const requestId = 'LV-' + year + '-' + String(count + 1).padStart(4, '0');

    const balanceSnapshot = {
      annualEntitled: entitlement,
      used,
      pending,
      available,
    };
    const submittedAt = dto.submit ? new Date() : null;
    const status = dto.submit ? 'PENDING' : 'DRAFT';

    const created = await this.prisma.leaveRequest.create({
      data: {
        requestId,
        userId: dto.userId,
        leaveType: dto.leaveType as never,
        startDate,
        endDate,
        daysRequested,
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
    });

    return mapLeaveRequestResponse(created);
  }
}
