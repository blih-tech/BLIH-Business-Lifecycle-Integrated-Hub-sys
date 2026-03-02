import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateFinalSettlementDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { calculateFinalSettlement } from '../settlement.utils';
import { mapFinalSettlement } from '../offboarding.mapper';

@Injectable()
export class CreateFinalSettlementUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateFinalSettlementDto) {
    await this.prisma.resignation.findUniqueOrThrow({
      where: { id: dto.resignationId },
    });
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      include: { compensation: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const baseSalary =
      user.compensation?.baseSalary != null
        ? Number(user.compensation.baseSalary)
        : 0;
    const lastDay = new Date(dto.lastWorkingDay);
    const daysWorked = lastDay.getDate();
    let leaveBalanceDays = 0;
    const balance = await this.prisma.leaveBalance.findFirst({
      where: {
        userId: dto.userId,
        leaveType: 'ANNUAL',
        year: lastDay.getFullYear(),
      },
    });
    if (balance)
      leaveBalanceDays = Math.max(
        0,
        Number(balance.totalDays) - Number(balance.usedDays),
      );
    const { earnings, deductions, netPayable } = calculateFinalSettlement(
      baseSalary,
      daysWorked,
      leaveBalanceDays,
      0,
      0,
      0,
    );
    const settlement = await this.prisma.finalSettlement.create({
      data: {
        userId: dto.userId,
        resignationId: dto.resignationId,
        lastWorkingDay: lastDay,
        earnings: earnings as never,
        deductions: deductions as never,
        netPayable,
        breakdownDocumentUrl: dto.breakdownDocumentUrl ?? null,
      },
    });
    return mapFinalSettlement(settlement);
  }
}
