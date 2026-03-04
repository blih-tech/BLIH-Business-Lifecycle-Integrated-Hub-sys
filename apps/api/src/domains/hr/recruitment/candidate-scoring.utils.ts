import type { AssessmentItemDto, ScreeningRecommendation } from '@repo/types';

const WEIGHTS: Record<string, number> = {
  experience: 30,
  skills: 35,
  education: 15,
  culture: 10,
  communication: 10,
};

function canonicalFactor(factor: string): keyof typeof WEIGHTS | null {
  const value = factor.trim().toLowerCase();

  if (value.includes('experience')) return 'experience';
  if (value.includes('skill')) return 'skills';
  if (value.includes('education')) return 'education';
  if (value.includes('culture')) return 'culture';
  if (value.includes('communication')) return 'communication';

  return null;
}

function normalizeScore(score: number): number {
  if (score <= 5) return Math.max(0, Math.min(100, score * 20));
  if (score <= 10) return Math.max(0, Math.min(100, score * 10));
  return Math.max(0, Math.min(100, score));
}

export function computeCandidateScreeningScore(
  assessments: AssessmentItemDto[],
) {
  let weightedScore = 0;
  let appliedWeight = 0;
  let fallbackTotal = 0;

  const breakdown = assessments.map((assessment) => {
    const factor = canonicalFactor(assessment.factor);
    const normalized = normalizeScore(assessment.rating);
    const weight = factor ? WEIGHTS[factor] : 0;

    if (weight > 0) {
      weightedScore += normalized * weight;
      appliedWeight += weight;
    }
    fallbackTotal += normalized;

    return {
      factor: assessment.factor,
      normalized,
      weightApplied: weight,
      notes: assessment.notes ?? null,
    };
  });

  const score =
    appliedWeight > 0
      ? weightedScore / appliedWeight
      : assessments.length > 0
        ? fallbackTotal / assessments.length
        : 0;

  let band: 'AUTO_SHORTLIST' | 'SHORTLIST' | 'REVIEW' | 'AUTO_DECLINE';
  let recommendation: ScreeningRecommendation;

  if (score >= 90) {
    band = 'AUTO_SHORTLIST';
    recommendation = 'SELECT';
  } else if (score >= 75) {
    band = 'SHORTLIST';
    recommendation = 'SELECT';
  } else if (score >= 50) {
    band = 'REVIEW';
    recommendation = 'PAUSE';
  } else {
    band = 'AUTO_DECLINE';
    recommendation = 'DECLINE';
  }

  return {
    score: Number(score.toFixed(2)),
    recommendation,
    band,
    breakdown,
  };
}
