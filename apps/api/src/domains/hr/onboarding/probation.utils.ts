import { BadRequestException } from '@nestjs/common';
import type {
  ConductDto,
  GoalReviewDto,
  ProbationEvaluationRound,
  ProbationRecommendation,
} from '@repo/types';

function average(values: number[]) {
  if (values.length === 0) return null;
  return Number(
    (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2),
  );
}

export function validateProbationGoals(goals: unknown[] | undefined) {
  if (!goals || goals.length < 3 || goals.length > 5) {
    throw new BadRequestException(
      'Probation plans must contain between 3 and 5 goals',
    );
  }
}

export function validateProbationWindow(start: Date, end: Date) {
  if (end <= start) {
    throw new BadRequestException(
      'Probation end date must be after start date',
    );
  }

  const diffDays = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays > 180) {
    throw new BadRequestException(
      'Probation period cannot exceed 6 months in a single plan',
    );
  }
}

export function computeProbationAverageRating(
  goalReviews?: GoalReviewDto[] | null,
  conduct?: ConductDto | null,
) {
  const ratings = [
    ...(goalReviews ?? [])
      .map((review) => review.rating)
      .filter((value): value is number => typeof value === 'number'),
    ...(conduct
      ? Object.values(conduct).filter(
          (value): value is number => typeof value === 'number',
        )
      : []),
  ];

  return average(ratings);
}

export function getRequiredProbationApprovals(input: {
  finalDecision?: ProbationRecommendation | null;
  extensionDays?: number | null;
}) {
  const approvals: Array<'SUPERVISOR' | 'HR_MANAGER' | 'CEO'> = [
    'SUPERVISOR',
    'HR_MANAGER',
  ];

  if (
    input.finalDecision === 'TERMINATE' ||
    (input.finalDecision === 'EXTEND' && (input.extensionDays ?? 0) > 90)
  ) {
    approvals.push('CEO');
  }

  return approvals;
}

export function normalizeProbationApprovalRole(role: string) {
  const normalized = role
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (normalized === 'HR') return 'HR_MANAGER';
  return normalized as 'SUPERVISOR' | 'HR_MANAGER' | 'CEO';
}

export function expectedEvaluationRoundDates(
  probationStart: Date,
  probationEnd: Date,
): Record<ProbationEvaluationRound, Date> {
  const start = new Date(probationStart);
  const day30 = new Date(start);
  day30.setDate(day30.getDate() + 30);

  const day55 = new Date(start);
  day55.setDate(day55.getDate() + 55);

  return {
    DAY_30: day30,
    DAY_55: day55,
    DAY_60_FINAL: probationEnd,
  };
}
