import type { PerformanceCategory } from '@repo/types';

const SELF_WEIGHT = 0.2;
const MANAGER_WEIGHT = 0.5;
const PEER_WEIGHT = 0.15;
const DIRECT_REPORT_WEIGHT = 0.1;
const SKIP_LEVEL_WEIGHT = 0.05;

const RAISE_MATRIX: Record<
  PerformanceCategory,
  { minPercent: number; maxPercent: number }
> = {
  OUTSTANDING: { minPercent: 10, maxPercent: 15 },
  EXCEEDS_EXPECTATIONS: { minPercent: 7, maxPercent: 10 },
  MEETS_EXPECTATIONS: { minPercent: 3, maxPercent: 5 },
  BELOW_EXPECTATIONS: { minPercent: 0, maxPercent: 0 },
  UNSATISFACTORY: { minPercent: -5, maxPercent: 0 },
};

function roundRating(value: number): number {
  return Math.round(value * 10) / 10;
}

export function calculateCategory(finalRating: number): PerformanceCategory {
  if (finalRating >= 4.5) return 'OUTSTANDING';
  if (finalRating >= 4.0) return 'EXCEEDS_EXPECTATIONS';
  if (finalRating >= 3.0) return 'MEETS_EXPECTATIONS';
  if (finalRating >= 2.0) return 'BELOW_EXPECTATIONS';
  return 'UNSATISFACTORY';
}

export function calculateFinalRatingAndCategory(
  selfAverage: number,
  managerAverage: number,
): { finalRating: number; category: PerformanceCategory } {
  const finalRating = roundRating(
    selfAverage * SELF_WEIGHT + managerAverage * MANAGER_WEIGHT,
  );
  const category = calculateCategory(finalRating);
  return { finalRating, category };
}

export function calculateWeightedFinalRatingAndCategory(inputs: {
  selfAverage: number;
  managerAverage: number;
  peerAverage?: number | null;
  directReportAverage?: number | null;
  skipLevelAverage?: number | null;
}): { finalRating: number; category: PerformanceCategory } {
  const weightedInputs = [
    { value: inputs.selfAverage, weight: SELF_WEIGHT },
    { value: inputs.managerAverage, weight: MANAGER_WEIGHT },
    { value: inputs.peerAverage ?? null, weight: PEER_WEIGHT },
    { value: inputs.directReportAverage ?? null, weight: DIRECT_REPORT_WEIGHT },
    { value: inputs.skipLevelAverage ?? null, weight: SKIP_LEVEL_WEIGHT },
  ].filter(
    (entry): entry is { value: number; weight: number } => entry.value != null,
  );

  const totalWeight = weightedInputs.reduce(
    (sum, entry) => sum + entry.weight,
    0,
  );
  const finalRating = roundRating(
    weightedInputs.reduce((sum, entry) => sum + entry.value * entry.weight, 0) /
      totalWeight,
  );
  const category = calculateCategory(finalRating);
  return { finalRating, category };
}

export function getRaiseRecommendation(category: PerformanceCategory): {
  minPercent: number;
  maxPercent: number;
} {
  return RAISE_MATRIX[category];
}

export function isPromotionEligible(category: PerformanceCategory): boolean {
  return category === 'EXCEEDS_EXPECTATIONS' || category === 'OUTSTANDING';
}
