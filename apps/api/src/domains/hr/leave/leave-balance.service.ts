import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { getAnnualEntitlement, roundDays } from './leave-entitlement';

function decimalToNumber(value: unknown): number {
  return typeof value === 'object' && value != null && 'toNumber' in value
    ? (value as { toNumber: () => number }).toNumber()
    : Number(value ?? 0);
}

type ResolvedLeaveBalance = {
  employeeId: string;
  leaveType: string;
  year: number;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  carriedOver: number;
  availableDays: number;
};

@Injectable()
export class LeaveBalanceService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureBalance(params: {
    employeeId: string;
    leaveType: string;
    year: number;
    employmentType: string;
  }): Promise<ResolvedLeaveBalance> {
    const totalDays = roundDays(
      getAnnualEntitlement(params.employmentType, params.leaveType),
    );

    const balance = await this.prisma.leaveBalance.upsert({
      where: {
        employeeId_leaveType_year: {
          employeeId: params.employeeId,
          leaveType: params.leaveType as never,
          year: params.year,
        },
      },
      update: {},
      create: {
        employeeId: params.employeeId,
        leaveType: params.leaveType as never,
        year: params.year,
        totalDays,
        carriedOver: 0,
      },
    });

    return this.mapBalance(balance);
  }

  async ensureBalancesForYear(params: {
    employeeId: string;
    year: number;
    employmentType: string;
    leaveType?: string;
  }): Promise<ResolvedLeaveBalance[]> {
    const types = params.leaveType
      ? [params.leaveType]
      : [
          'ANNUAL',
          'SICK',
          'MATERNITY',
          'PATERNITY',
          'BEREAVEMENT',
          'UNPAID',
          'STUDY',
          'EMERGENCY',
          'COMPASSIONATE',
        ];

    const balances: ResolvedLeaveBalance[] = [];
    for (const type of types) {
      balances.push(
        await this.ensureBalance({
          employeeId: params.employeeId,
          leaveType: type,
          year: params.year,
          employmentType: params.employmentType,
        }),
      );
    }

    return balances;
  }

  assertAvailability(balance: ResolvedLeaveBalance, days: number) {
    if (balance.leaveType === 'UNPAID') {
      return;
    }
    if (days > balance.availableDays) {
      throw new BadRequestException(
        `Insufficient leave balance. Available: ${balance.availableDays}, requested: ${roundDays(days)}`,
      );
    }
  }

  async reserveDays(params: {
    employeeId: string;
    leaveType: string;
    year: number;
    days: number;
    employmentType: string;
  }) {
    const balance = await this.ensureBalance(params);
    this.assertAvailability(balance, params.days);

    return this.prisma.leaveBalance.update({
      where: {
        employeeId_leaveType_year: {
          employeeId: params.employeeId,
          leaveType: params.leaveType as never,
          year: params.year,
        },
      },
      data: {
        pendingDays: { increment: roundDays(params.days) },
      },
    });
  }

  async consumeReservedDays(params: {
    employeeId: string;
    leaveType: string;
    year: number;
    days: number;
  }) {
    const balance = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveType_year: {
          employeeId: params.employeeId,
          leaveType: params.leaveType as never,
          year: params.year,
        },
      },
    });

    if (!balance) {
      throw new BadRequestException('Leave balance record not found');
    }

    const pendingDays = decimalToNumber(balance.pendingDays);
    if (pendingDays < params.days) {
      throw new BadRequestException('Reserved leave balance is inconsistent');
    }

    return this.prisma.leaveBalance.update({
      where: {
        employeeId_leaveType_year: {
          employeeId: params.employeeId,
          leaveType: params.leaveType as never,
          year: params.year,
        },
      },
      data: {
        pendingDays: { decrement: roundDays(params.days) },
        usedDays: { increment: roundDays(params.days) },
      },
    });
  }

  async releaseReservedDays(params: {
    employeeId: string;
    leaveType: string;
    year: number;
    days: number;
  }) {
    const balance = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveType_year: {
          employeeId: params.employeeId,
          leaveType: params.leaveType as never,
          year: params.year,
        },
      },
    });

    if (!balance) {
      return null;
    }

    const pendingDays = decimalToNumber(balance.pendingDays);
    if (pendingDays <= 0) {
      return balance;
    }

    return this.prisma.leaveBalance.update({
      where: {
        employeeId_leaveType_year: {
          employeeId: params.employeeId,
          leaveType: params.leaveType as never,
          year: params.year,
        },
      },
      data: {
        pendingDays: {
          decrement: roundDays(Math.min(pendingDays, params.days)),
        },
      },
    });
  }

  private mapBalance(balance: {
    employeeId: string;
    leaveType: string;
    year: number;
    totalDays: unknown;
    usedDays: unknown;
    pendingDays: unknown;
    carriedOver: unknown;
  }): ResolvedLeaveBalance {
    const totalDays = decimalToNumber(balance.totalDays);
    const usedDays = decimalToNumber(balance.usedDays);
    const pendingDays = decimalToNumber(balance.pendingDays);
    const carriedOver = decimalToNumber(balance.carriedOver);
    const availableDays = roundDays(
      Math.max(0, totalDays + carriedOver - usedDays - pendingDays),
    );

    return {
      employeeId: balance.employeeId,
      leaveType: balance.leaveType,
      year: balance.year,
      totalDays: roundDays(totalDays),
      usedDays: roundDays(usedDays),
      pendingDays: roundDays(pendingDays),
      carriedOver: roundDays(carriedOver),
      availableDays,
    };
  }
}
