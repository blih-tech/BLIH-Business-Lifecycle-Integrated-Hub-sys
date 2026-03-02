import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { getAnnualEntitlement, roundDays } from '../leave-entitlement';

@Injectable()
export class GetLeaveBalanceUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, leaveType?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        employment: { select: { employmentType: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const employmentType = user.employment?.employmentType ?? 'FULL_TIME';
    const types: string[] = leaveType
      ? [leaveType]
      : [
          'ANNUAL',
          'SICK',
          'MATERNITY',
          'PATERNITY',
          'BEREAVEMENT',
          'STUDY',
          'EMERGENCY',
          'COMPASSIONATE',
        ];

    const year = new Date().getFullYear();
    const yearStart = new Date(`${year}-01-01`);
    const yearEnd = new Date(`${year}-12-31`);

    const result: Array<{
      leaveType: string;
      entitled: number;
      used: number;
      pending: number;
      available: number;
    }> = [];

    for (const type of types) {
      const entitlement = getAnnualEntitlement(employmentType, type);

      const approved = await this.prisma.leaveRequest.findMany({
        where: {
          userId,
          leaveType: type as never,
          status: 'APPROVED',
          startDate: { gte: yearStart, lte: yearEnd },
        },
        select: { daysRequested: true },
      });
      const used = approved.reduce((s, r) => s + Number(r.daysRequested), 0);

      const pendingReqs = await this.prisma.leaveRequest.findMany({
        where: {
          userId,
          leaveType: type as never,
          status: 'PENDING',
          startDate: { gte: yearStart, lte: yearEnd },
        },
        select: { daysRequested: true },
      });
      const pending = pendingReqs.reduce(
        (s, r) => s + Number(r.daysRequested),
        0,
      );

      const available = roundDays(Math.max(0, entitlement - used - pending));
      result.push({
        leaveType: type,
        entitled: entitlement,
        used: roundDays(used),
        pending: roundDays(pending),
        available,
      });
    }

    return result;
  }
}
