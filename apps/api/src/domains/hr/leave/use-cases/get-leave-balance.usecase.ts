import { Injectable } from '@nestjs/common';
import { HrUserLifecycleService } from '../../hr-user-lifecycle.service';
import { LeaveBalanceService } from '../leave-balance.service';

@Injectable()
export class GetLeaveBalanceUseCase {
  constructor(
    private readonly lifecycle: HrUserLifecycleService,
    private readonly leaveBalance: LeaveBalanceService,
  ) {}

  async execute(employeeId: string, leaveType?: string) {
    const employee = await this.lifecycle.getUserForLeave(employeeId);
    const employmentType = employee.employment?.employmentType ?? 'FULL_TIME';
    const year = new Date().getUTCFullYear();
    const balances = await this.leaveBalance.ensureBalancesForYear({
      employeeId: employee.id,
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
