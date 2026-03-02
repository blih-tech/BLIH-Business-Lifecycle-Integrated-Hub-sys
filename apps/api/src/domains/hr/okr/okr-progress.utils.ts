import { BadRequestException } from '@nestjs/common';
import type { KeyResultStatus, KeyResultType, OkrStatus } from '@repo/types';

function toNum(value: unknown): number {
  if (value == null) return 0;
  if (
    typeof value === 'object' &&
    value !== null &&
    'toNumber' in (value as object)
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

export function computeKeyResultProgress(
  type: KeyResultType,
  targetValue: number,
  currentValue: number | null,
): { progress: number; status: KeyResultStatus } {
  const target = toNum(targetValue);
  const current = currentValue != null ? toNum(currentValue) : 0;
  let progress = 0;
  if (type === 'BOOLEAN') {
    progress = current ? 100 : 0;
  } else if (target > 0) {
    progress = Math.min(100, (current / target) * 100);
  }
  progress = Math.round(progress);
  const status: KeyResultStatus =
    progress >= 100
      ? 'ACHIEVED'
      : progress >= 70
        ? 'ON_TRACK'
        : progress >= 40
          ? 'AT_RISK'
          : 'DELAYED';
  return { progress, status };
}

export function assertWeightTotal(
  keyResults: Array<{ weight: number }>,
  expectedTotal = 100,
) {
  const total = keyResults.reduce(
    (sum, keyResult) => sum + keyResult.weight,
    0,
  );
  if (total !== expectedTotal) {
    throw new BadRequestException(
      `Key result weights must total ${expectedTotal}, received ${total}`,
    );
  }
}

export function computeOkrOverall(
  keyResults: Array<{
    progress: number;
    status: KeyResultStatus;
    weight: number;
  }>,
): { overallProgress: number; overallStatus: OkrStatus } {
  if (keyResults.length === 0) {
    return { overallProgress: 0, overallStatus: 'ACTIVE' };
  }

  assertWeightTotal(keyResults);

  const weightedProgress = keyResults.reduce(
    (sum, keyResult) => sum + keyResult.progress * (keyResult.weight / 100),
    0,
  );
  const overallProgress = Math.round(weightedProgress);
  const delayedWeight = keyResults
    .filter((keyResult) => keyResult.status === 'DELAYED')
    .reduce((sum, keyResult) => sum + keyResult.weight, 0);
  const atRiskWeight = keyResults
    .filter((keyResult) => keyResult.status === 'AT_RISK')
    .reduce((sum, keyResult) => sum + keyResult.weight, 0);
  const achievedWeight = keyResults
    .filter((keyResult) => keyResult.status === 'ACHIEVED')
    .reduce((sum, keyResult) => sum + keyResult.weight, 0);

  let overallStatus: OkrStatus = 'ACTIVE';
  if (achievedWeight === 100) overallStatus = 'ACHIEVED';
  else if (delayedWeight >= 25) overallStatus = 'DELAYED';
  else if (atRiskWeight >= 40) overallStatus = 'AT_RISK';

  return { overallProgress, overallStatus };
}
