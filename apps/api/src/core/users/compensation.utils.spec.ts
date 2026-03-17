import { buildCompensationSummary } from './compensation.utils';

describe('buildCompensationSummary', () => {
  it('calculates annual and period totals using active recurring components', () => {
    const summary = buildCompensationSummary(
      {
        baseSalary: '5000',
        currency: 'USD',
        payFrequency: 'MONTHLY',
        bonusEligible: true,
        bonusRate: '10',
      },
      [
        {
          amount: '500',
          isRecurring: true,
          effectiveFrom: '2026-01-01T00:00:00.000Z',
          effectiveTo: null,
        },
        {
          amount: '1200',
          isRecurring: false,
          effectiveFrom: '2026-01-01T00:00:00.000Z',
          effectiveTo: '2026-12-31T00:00:00.000Z',
        },
      ],
      new Date('2026-03-01T00:00:00.000Z'),
    );

    expect(summary).toEqual({
      currency: 'USD',
      annualBaseSalary: 60000,
      periodBaseSalary: 5000,
      recurringAnnualComponents: 6000,
      recurringPeriodComponents: 500,
      oneTimeComponentsTotal: 1200,
      estimatedAnnualBonus: 6000,
      totalAnnualCompensation: 72000,
      totalPeriodCompensation: 5500,
    });
  });
});
