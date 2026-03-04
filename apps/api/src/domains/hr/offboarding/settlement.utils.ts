/**
 * HR_LOGIC §9.2: Final settlement - salary days, leave encashment, deductions (PAYE, pension 7%, loan max 50%).
 */
import type { EarningsDto, DeductionsDto } from '@repo/types';

export function calculateFinalSettlement(
  baseSalaryPerMonth: number,
  daysWorkedInFinalMonth: number,
  leaveBalanceDays: number,
  proratedBonus: number,
  overtimeDue: number,
  outstandingLoan: number,
): { earnings: EarningsDto; deductions: DeductionsDto; netPayable: number } {
  const dailyRate = baseSalaryPerMonth / 30;
  const earnings: EarningsDto = {
    salaryDaysWorked: Math.round(dailyRate * daysWorkedInFinalMonth),
    leaveEncashment: Math.round(dailyRate * leaveBalanceDays),
    proratedBonus: Math.round(proratedBonus),
    overtime: Math.round(overtimeDue),
  };
  let grossEarnings = 0;
  for (const v of Object.values(earnings)) grossEarnings += Number(v) || 0;
  const tax = Math.round(grossEarnings * 0.2);
  const pension = Math.round(grossEarnings * 0.07);
  const loanRecovery = Math.min(
    outstandingLoan,
    Math.round(grossEarnings * 0.5),
  );
  const deductions: DeductionsDto = { tax, pension, loanRecovery };
  let totalDeductions = 0;
  for (const v of Object.values(deductions)) totalDeductions += Number(v) || 0;
  const netPayable = grossEarnings - totalDeductions;
  return { earnings, deductions, netPayable };
}
