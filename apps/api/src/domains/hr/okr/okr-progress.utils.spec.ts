import { BadRequestException } from '@nestjs/common';
import { assertWeightTotal, computeOkrOverall } from './okr-progress.utils';

describe('okr-progress.utils', () => {
  it('computes weighted OKR progress from key result weights', () => {
    const overall = computeOkrOverall([
      { progress: 100, status: 'ACHIEVED', weight: 70 },
      { progress: 50, status: 'AT_RISK', weight: 30 },
    ]);

    expect(overall.overallProgress).toBe(85);
    expect(overall.overallStatus).toBe('ACTIVE');
  });

  it('rejects invalid weight totals', () => {
    expect(() => assertWeightTotal([{ weight: 40 }, { weight: 40 }])).toThrow(
      BadRequestException,
    );
  });
});
