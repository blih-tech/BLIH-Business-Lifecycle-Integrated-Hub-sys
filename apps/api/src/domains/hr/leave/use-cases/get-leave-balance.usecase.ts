import { Injectable } from '@nestjs/common';
import { HrUserLifecycleService } from '../../hr-user-lifecycle.service';
import { LeaveBalanceService } from '../leave-balance.service';

@Injectable()
export class GetLeaveBalanceUseCase {
  constructor(
    private readonly lifecycle: HrUserLifecycleService,
    private readonly leaveBalance: LeaveBalanceService,
  ) {}

  async execute(userId: string, leaveType?: string) {
    const user = await this.lifecycle.getUserForLeave(userId);
    const employmentType = user.employment?.employmentType ?? 'FULL_TIME';
    const year = new Date().getUTCFullYear();
    const balances = await this.leaveBalance.ensureBalancesForYear({
      userId,
      year,
      employmentType,
      leaveType,
    });

    return balances.map((balance) => ({
      leaveType: balance.leaveType,
      year: balance.year,
      totalDays: balance.totalDays,
      carriedOver: balance.carriedOver,
      used: balance.usedDays,
      pending: balance.pendingDays,
      available: balance.availableDays,
    }));
  }
}
