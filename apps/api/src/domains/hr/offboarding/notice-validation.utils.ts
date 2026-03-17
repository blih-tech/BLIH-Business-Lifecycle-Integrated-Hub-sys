import type { ValidateResignationResultDto } from '@repo/types';

const NOTICE_DAYS: Record<string, number> = {
  FULL_TIME: 30,
  PART_TIME: 14,
  CONTRACT: 30,
  INTERN: 7,
  TEMPORARY: 14,
};

export function businessDaysBetween(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endNorm = new Date(end);
  endNorm.setHours(0, 0, 0, 0);
  while (current < endNorm) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

export function getRequiredNoticeDays(employmentType: string): number {
  return NOTICE_DAYS[employmentType] ?? 30;
}

export function validateResignationNotice(
  employmentType: string,
  proposedLastDay: Date,
  isOnProbation: boolean,
  options: { criticalProjectsCount?: number; leaveBalanceDays?: number },
): ValidateResignationResultDto {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const requiredDays = isOnProbation
    ? 7
    : getRequiredNoticeDays(employmentType);
  const actualDays = businessDaysBetween(today, proposedLastDay);
  const result: ValidateResignationResultDto = {
    valid: true,
    warnings: [],
    errors: [],
    requiredNoticeDays: requiredDays,
    actualNoticeDays: actualDays,
  };
  if (actualDays < requiredDays) {
    result.errors.push({
      code: 'INSUFFICIENT_NOTICE',
      message: `Minimum ${requiredDays} business days required. You provided ${actualDays}.`,
      requires_waiver: true,
      waiver_approvers: ['MANAGER', 'HR'],
    });
    result.valid = false;
  }
  if (options.criticalProjectsCount && options.criticalProjectsCount > 0) {
    result.warnings.push({
      code: 'CRITICAL_PROJECTS',
      message: `You are assigned to ${options.criticalProjectsCount} critical project(s).`,
      suggested_handover_days: Math.min(actualDays, 14),
    });
  }
  if (options.leaveBalanceDays && options.leaveBalanceDays > 0) {
    result.warnings.push({
      code: 'LEAVE_BALANCE',
      message: `You have ${options.leaveBalanceDays} days of annual leave.`,
      options: ['ENCASH', 'TAKE_BEFORE_LEAVING', 'FORFEIT'],
    });
  }
  if (isOnProbation) {
    result.warnings.push({
      code: 'PROBATION_NOTICE',
      message: 'You are on probation. Reduced notice period may apply.',
      reduced_notice_days: 7,
    });
  }
  return result;
}
