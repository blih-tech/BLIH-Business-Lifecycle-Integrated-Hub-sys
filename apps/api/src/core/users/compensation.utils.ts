import type { PayFrequency, UserCompensationResponseDto } from '@repo/types';

type CompensationLike = Pick<
  UserCompensationResponseDto,
  'baseSalary' | 'currency' | 'payFrequency' | 'bonusEligible' | 'bonusRate'
>;

type CompensationComponentLike = Pick<
  {
    amount: string;
    isRecurring: boolean;
    effectiveFrom: string;
    effectiveTo: string | null;
  },
  'amount' | 'isRecurring' | 'effectiveFrom' | 'effectiveTo'
>;

export function normalizeCompensationToAnnual(
  amount: number,
  frequency: PayFrequency,
) {
  switch (frequency) {
    case 'ANNUAL':
      return amount;
    case 'MONTHLY':
      return amount * 12;
    case 'BIWEEKLY':
      return amount * 26;
    case 'WEEKLY':
      return amount * 52;
    default:
      return amount;
  }
}

function round(value: number) {
  return Number(value.toFixed(2));
}

function isActiveOn(date: Date, component: CompensationComponentLike) {
  const effectiveFrom = new Date(component.effectiveFrom);
  const effectiveTo = component.effectiveTo
    ? new Date(component.effectiveTo)
    : null;
  return effectiveFrom <= date && (!effectiveTo || effectiveTo >= date);
}

export function buildCompensationSummary(
  compensation: CompensationLike,
  components: CompensationComponentLike[],
  asOf = new Date(),
) {
  const baseSalary = Number(compensation.baseSalary ?? 0);
  const annualBaseSalary = normalizeCompensationToAnnual(
    baseSalary,
    compensation.payFrequency,
  );

  const activeRecurringComponents = components.filter(
    (component) => component.isRecurring && isActiveOn(asOf, component),
  );
  const activeOneTimeComponents = components.filter(
    (component) => !component.isRecurring && isActiveOn(asOf, component),
  );

  const recurringPeriodComponents = activeRecurringComponents.reduce(
    (total, component) => total + Number(component.amount),
    0,
  );
  const recurringAnnualComponents = activeRecurringComponents.reduce(
    (total, component) =>
      total +
      normalizeCompensationToAnnual(
        Number(component.amount),
        compensation.payFrequency,
      ),
    0,
  );
  const oneTimeComponentsTotal = activeOneTimeComponents.reduce(
    (total, component) => total + Number(component.amount),
    0,
  );

  const estimatedAnnualBonus = compensation.bonusEligible
    ? round(annualBaseSalary * (Number(compensation.bonusRate ?? 0) / 100))
    : null;

  return {
    currency: compensation.currency ?? null,
    annualBaseSalary: round(annualBaseSalary),
    periodBaseSalary: round(baseSalary),
    recurringAnnualComponents: round(recurringAnnualComponents),
    recurringPeriodComponents: round(recurringPeriodComponents),
    oneTimeComponentsTotal: round(oneTimeComponentsTotal),
    estimatedAnnualBonus,
    totalAnnualCompensation: round(
      annualBaseSalary +
        recurringAnnualComponents +
        (estimatedAnnualBonus ?? 0),
    ),
    totalPeriodCompensation: round(baseSalary + recurringPeriodComponents),
  };
}
