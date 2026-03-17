/** Annual entitlement days by employment type and leave type (from HR_LOGIC). */
const ENTITLEMENT: Record<string, Record<string, number>> = {
  FULL_TIME: {
    ANNUAL: 20,
    SICK: 10,
    MATERNITY: 90,
    PATERNITY: 3,
    BEREAVEMENT: 5,
    STUDY: 5,
    EMERGENCY: 5,
    UNPAID: 0,
    COMPASSIONATE: 5,
  },
  PART_TIME: {
    ANNUAL: 10,
    SICK: 5,
    MATERNITY: 90,
    PATERNITY: 3,
    BEREAVEMENT: 5,
    STUDY: 2,
    EMERGENCY: 5,
    UNPAID: 0,
    COMPASSIONATE: 5,
  },
  CONTRACT: {
    ANNUAL: 20,
    SICK: 10,
    MATERNITY: 90,
    PATERNITY: 3,
    BEREAVEMENT: 5,
    STUDY: 0,
    EMERGENCY: 5,
    UNPAID: 0,
    COMPASSIONATE: 5,
  },
  INTERN: {
    ANNUAL: 0,
    SICK: 5,
    MATERNITY: 90,
    PATERNITY: 3,
    BEREAVEMENT: 5,
    STUDY: 5,
    EMERGENCY: 5,
    UNPAID: 0,
    COMPASSIONATE: 5,
  },
  TEMPORARY: {
    ANNUAL: 10,
    SICK: 5,
    MATERNITY: 90,
    PATERNITY: 3,
    BEREAVEMENT: 5,
    STUDY: 0,
    EMERGENCY: 5,
    UNPAID: 0,
    COMPASSIONATE: 5,
  },
};

const DEFAULT_ENTITLEMENT: Record<string, number> = {
  ANNUAL: 20,
  SICK: 10,
  MATERNITY: 90,
  PATERNITY: 3,
  BEREAVEMENT: 5,
  STUDY: 5,
  EMERGENCY: 5,
  UNPAID: 0,
  COMPASSIONATE: 5,
};

export function getAnnualEntitlement(
  employmentType: string,
  leaveType: string,
): number {
  const byType = ENTITLEMENT[employmentType] ?? ENTITLEMENT.FULL_TIME;
  return byType[leaveType] ?? DEFAULT_ENTITLEMENT[leaveType] ?? 0;
}

/** Round to 1 decimal. */
export function roundDays(value: number): number {
  return Math.round(value * 10) / 10;
}
