import { BadRequestException } from '@nestjs/common';
import {
  computeProbationAverageRating,
  getRequiredProbationApprovals,
  validateProbationGoals,
  validateProbationWindow,
} from './probation.utils';

describe('probation.utils', () => {
  it('enforces the documented 3-5 goal range', () => {
    expect(() => validateProbationGoals([{ id: 1 }, { id: 2 }])).toThrow(
      BadRequestException,
    );

    expect(() =>
      validateProbationGoals([
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 },
      ]),
    ).toThrow(BadRequestException);
  });

  it('caps a single probation plan at six months', () => {
    expect(() =>
      validateProbationWindow(new Date('2026-01-01'), new Date('2026-08-01')),
    ).toThrow(BadRequestException);
  });

  it('computes the average rating across goal and conduct reviews', () => {
    expect(
      computeProbationAverageRating(
        [
          { goalId: 'quality', rating: 4 },
          { goalId: 'delivery', rating: 5 },
        ],
        {
          timekeeping: 4,
          collaboration: 3,
          communication: 5,
          drive: 4,
        },
      ),
    ).toBe(4.17);
  });

  it('requires CEO approval for long extensions', () => {
    expect(
      getRequiredProbationApprovals({
        finalDecision: 'EXTEND',
        extensionDays: 120,
      }),
    ).toEqual(['SUPERVISOR', 'HR_MANAGER', 'CEO']);
  });
});
