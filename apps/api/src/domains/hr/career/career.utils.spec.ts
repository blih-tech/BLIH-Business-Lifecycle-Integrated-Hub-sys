import { BadRequestException } from '@nestjs/common';
import {
  computeCareerPlanProgress,
  computePercentChange,
  deriveCareerPlanStatus,
  normalizeCareerGoals,
} from './career.utils';

describe('career.utils', () => {
  it('normalizes career goals and auto-completes 100% goals', () => {
    const goals = normalizeCareerGoals([
      {
        id: '',
        title: 'Lead quarterly architecture review',
        status: 'IN_PROGRESS',
        progress: 100,
      },
    ]);

    expect(goals[0]).toMatchObject({
      id: 'goal-1',
      title: 'Lead quarterly architecture review',
      status: 'COMPLETED',
      progress: 100,
    });
    expect(goals[0].completedAt).toEqual(expect.any(String));
  });

  it('derives active and completed plan states from goal progress', () => {
    const activeGoals = normalizeCareerGoals([
      {
        id: 'g1',
        title: 'Build leadership capability',
        status: 'IN_PROGRESS',
        progress: 40,
      },
    ]);
    const completedGoals = normalizeCareerGoals([
      {
        id: 'g1',
        title: 'Complete promotion readiness track',
        status: 'COMPLETED',
        progress: 100,
      },
    ]);

    expect(computeCareerPlanProgress(activeGoals)).toBe(40);
    expect(deriveCareerPlanStatus(activeGoals)).toBe('ACTIVE');
    expect(deriveCareerPlanStatus(completedGoals)).toBe('COMPLETED');
  });

  it('computes percent change and rejects non-positive salary proposals', () => {
    expect(computePercentChange(1000, 1125)).toBe(12.5);
    expect(computePercentChange(null, 500)).toBe(100);
    expect(() => computePercentChange(1000, 0)).toThrow(BadRequestException);
  });
});
