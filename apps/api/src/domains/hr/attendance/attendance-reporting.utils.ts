import { formatDateOnly } from './attendance-date.util';

const ATTENDED_STATUSES = new Set([
  'PRESENT',
  'LATE',
  'EARLY_DEPARTURE',
  'HALF_DAY',
  'REMOTE',
  'BUSINESS_TRIP',
]);

export interface AttendanceSummaryLogRow {
  date: Date;
  status: string;
  totalMinutes: number | null;
  overtimeMinutes: number | null;
  overtimeApproved: boolean;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  notes: string | null;
}

export interface AttendanceSummary {
  trackedDays: number;
  workedDays: number;
  leaveDays: number;
  absenceDays: number;
  remoteDays: number;
  lateCount: number;
  earlyDepartureCount: number;
  totalWorkedMinutes: number;
  overtimeMinutes: number;
  attendanceRate: number;
  punctualityRate: number;
  dailyEntries: Array<{
    date: string;
    status: string;
    totalMinutes: number;
    overtimeMinutes: number;
    overtimeApproved: boolean;
    checkInAt: string | null;
    checkOutAt: string | null;
    notes: string | null;
  }>;
}

function toRate(value: number, denominator: number) {
  if (denominator <= 0) {
    return 0;
  }

  return Math.round((value / denominator) * 10000) / 100;
}

export function summarizeAttendanceLogs(
  logs: AttendanceSummaryLogRow[],
): AttendanceSummary {
  const trackedDays = logs.length;
  let workedDays = 0;
  let leaveDays = 0;
  let absenceDays = 0;
  let remoteDays = 0;
  let lateCount = 0;
  let earlyDepartureCount = 0;
  let totalWorkedMinutes = 0;
  let overtimeMinutes = 0;

  for (const log of logs) {
    if (ATTENDED_STATUSES.has(log.status)) {
      workedDays += 1;
    }
    if (log.status === 'ON_LEAVE') {
      leaveDays += 1;
    }
    if (log.status === 'ABSENT') {
      absenceDays += 1;
    }
    if (log.status === 'REMOTE') {
      remoteDays += 1;
    }
    if (log.status === 'LATE') {
      lateCount += 1;
    }
    if (log.status === 'EARLY_DEPARTURE') {
      earlyDepartureCount += 1;
    }

    totalWorkedMinutes += log.totalMinutes ?? 0;
    overtimeMinutes += log.overtimeMinutes ?? 0;
  }

  const accountableDays = workedDays + absenceDays + earlyDepartureCount;
  const onTimeDays = Math.max(0, workedDays - lateCount);

  return {
    trackedDays,
    workedDays,
    leaveDays,
    absenceDays,
    remoteDays,
    lateCount,
    earlyDepartureCount,
    totalWorkedMinutes,
    overtimeMinutes,
    attendanceRate: toRate(workedDays, accountableDays || workedDays),
    punctualityRate: toRate(onTimeDays, workedDays),
    dailyEntries: logs.map((log) => ({
      date: formatDateOnly(log.date),
      status: log.status,
      totalMinutes: log.totalMinutes ?? 0,
      overtimeMinutes: log.overtimeMinutes ?? 0,
      overtimeApproved: log.overtimeApproved,
      checkInAt: log.checkInAt?.toISOString() ?? null,
      checkOutAt: log.checkOutAt?.toISOString() ?? null,
      notes: log.notes,
    })),
  };
}

export function emptyAttendanceSummary(): AttendanceSummary {
  return {
    trackedDays: 0,
    workedDays: 0,
    leaveDays: 0,
    absenceDays: 0,
    remoteDays: 0,
    lateCount: 0,
    earlyDepartureCount: 0,
    totalWorkedMinutes: 0,
    overtimeMinutes: 0,
    attendanceRate: 0,
    punctualityRate: 0,
    dailyEntries: [],
  };
}

export function aggregateAttendanceSummaries(summaries: AttendanceSummary[]) {
  const aggregate = summaries.reduce(
    (acc, summary) => {
      acc.trackedDays += summary.trackedDays;
      acc.workedDays += summary.workedDays;
      acc.leaveDays += summary.leaveDays;
      acc.absenceDays += summary.absenceDays;
      acc.remoteDays += summary.remoteDays;
      acc.lateCount += summary.lateCount;
      acc.earlyDepartureCount += summary.earlyDepartureCount;
      acc.totalWorkedMinutes += summary.totalWorkedMinutes;
      acc.overtimeMinutes += summary.overtimeMinutes;
      return acc;
    },
    {
      trackedDays: 0,
      workedDays: 0,
      leaveDays: 0,
      absenceDays: 0,
      remoteDays: 0,
      lateCount: 0,
      earlyDepartureCount: 0,
      totalWorkedMinutes: 0,
      overtimeMinutes: 0,
    },
  );

  return {
    ...aggregate,
    attendanceRate: toRate(
      aggregate.workedDays,
      aggregate.workedDays +
        aggregate.absenceDays +
        aggregate.earlyDepartureCount,
    ),
    punctualityRate: toRate(
      Math.max(0, aggregate.workedDays - aggregate.lateCount),
      aggregate.workedDays,
    ),
  };
}
