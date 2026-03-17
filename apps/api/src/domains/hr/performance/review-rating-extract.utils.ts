function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function avg(numbers: number[]): number {
  if (numbers.length === 0) {
    return 0;
  }
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function collectNumericValues(value: unknown): number[] {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(collectNumericValues);
  }
  if (isRecord(value)) {
    return Object.values(value).flatMap(collectNumericValues);
  }
  return [];
}

export function getSelfRatingAverage(selfAssessment: unknown): number | null {
  if (!isRecord(selfAssessment)) return null;
  const goalRatings = selfAssessment.goalRatings;
  if (!Array.isArray(goalRatings)) return null;
  const ratings = goalRatings
    .map((goal) =>
      isRecord(goal) && typeof goal.selfRating === 'number'
        ? goal.selfRating
        : null,
    )
    .filter((rating): rating is number => rating !== null);
  if (ratings.length === 0) return null;
  return avg(ratings);
}

export function getManagerRatingAverage(managerReview: unknown): number | null {
  if (!isRecord(managerReview)) return null;
  if (typeof managerReview.overallRating === 'number') {
    return managerReview.overallRating;
  }

  const goalRatings = managerReview.goalRatings;
  if (!Array.isArray(goalRatings)) return null;
  const ratings = goalRatings
    .map((goal) =>
      isRecord(goal) && typeof goal.managerRating === 'number'
        ? goal.managerRating
        : null,
    )
    .filter((rating): rating is number => rating !== null);
  if (ratings.length === 0) return null;
  return avg(ratings);
}

export function getFeedbackRatingAverage(ratings: unknown): number | null {
  const values = collectNumericValues(ratings);
  if (values.length === 0) {
    return null;
  }
  return avg(values);
}

export function getRoleFeedbackAverage(
  feedbacks: Array<{ role: string; ratings: unknown }>,
  role: string,
): number | null {
  const values = feedbacks
    .filter((feedback) => feedback.role === role)
    .map((feedback) => getFeedbackRatingAverage(feedback.ratings))
    .filter((value): value is number => value !== null);

  if (values.length === 0) {
    return null;
  }

  return avg(values);
}
