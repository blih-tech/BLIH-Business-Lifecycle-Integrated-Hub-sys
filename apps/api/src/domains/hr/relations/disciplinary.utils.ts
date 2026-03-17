/**
 * HR_LOGIC §8.1: Escalation matrix by incident type and prior active count.
 */
import type {
  DisciplinaryIncidentType,
  DisciplinaryActionType,
} from '@repo/types';

type MatrixEntry = {
  action: DisciplinaryActionType;
  expiresMonths?: number;
  durationMonths?: number;
  durationDays?: number;
};

const ATTENDANCE: MatrixEntry[] = [
  { action: 'VERBAL_WARNING', expiresMonths: 6 },
  { action: 'WRITTEN_WARNING', expiresMonths: 12 },
  { action: 'FINAL_WARNING', expiresMonths: 12 },
  { action: 'TERMINATION' },
];
const PERFORMANCE: MatrixEntry[] = [
  { action: 'PERFORMANCE_IMPROVEMENT_PLAN', durationMonths: 3 },
  { action: 'WRITTEN_WARNING' },
  { action: 'TERMINATION' },
];
const CODE_OF_CONDUCT: Record<string, MatrixEntry[]> = {
  minor: [{ action: 'WRITTEN_WARNING' }],
  major: [{ action: 'SUSPENSION', durationDays: 3 }],
  severe: [{ action: 'TERMINATION' }],
};

export function getSuggestedAction(
  incidentType: DisciplinaryIncidentType,
  activePriorCount: number,
  codeOfConductLevel?: 'minor' | 'major' | 'severe',
): {
  action: DisciplinaryActionType;
  expiresMonths?: number;
  durationMonths?: number;
  durationDays?: number;
} | null {
  if (incidentType === 'CODE_OF_CONDUCT' && codeOfConductLevel) {
    const arr = CODE_OF_CONDUCT[codeOfConductLevel];
    return arr?.[0] ?? null;
  }
  if (incidentType === 'ATTENDANCE_VIOLATION') {
    const entry = ATTENDANCE[Math.min(activePriorCount, ATTENDANCE.length - 1)];
    return entry ?? null;
  }
  if (incidentType === 'PERFORMANCE_ISSUE') {
    const entry =
      PERFORMANCE[Math.min(activePriorCount, PERFORMANCE.length - 1)];
    return entry ?? null;
  }
  return null;
}

export function requiresTerminationApproval(
  actionType: DisciplinaryActionType,
): boolean {
  return actionType === 'TERMINATION';
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
