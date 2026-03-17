export function gapPriority(gap: number): 'HIGH' | 'MEDIUM' {
  return gap >= 2 ? 'HIGH' : 'MEDIUM';
}

export function readinessScore(totalGap: number): number {
  return Math.max(0, Math.min(100, Math.round(100 - totalGap * 10)));
}

const LEVEL_ORDER = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const;

export function computeGap(
  requiredLevel: string,
  currentLevel: string | null,
): number {
  const r = LEVEL_ORDER.indexOf(requiredLevel as (typeof LEVEL_ORDER)[number]);
  const c = currentLevel
    ? LEVEL_ORDER.indexOf(currentLevel as (typeof LEVEL_ORDER)[number])
    : -1;
  const ri = r >= 0 ? r : 0;
  const ci = c >= 0 ? c : 0;
  return Math.max(0, ri - ci);
}
