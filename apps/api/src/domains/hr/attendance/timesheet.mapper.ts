import type { TimesheetResponseDto } from '@repo/types';

type TimesheetRow = {
  id: string;
  timesheetId: string;
  employeeId: string;
  periodStart: Date;
  periodEnd: Date;
  trackedDays: number;
  workedDays: number;
  leaveDays: { toString(): string } | number;
  absenceDays: { toString(): string } | number;
  remoteDays: number;
  lateCount: number;
  earlyDepartureCount: number;
  totalWorkedMinutes: number;
  overtimeMinutes: number;
  attendanceRate: { toString(): string } | number;
  punctualityRate: { toString(): string } | number;
  sourceSnapshot: unknown;
  notes: string | null;
  status: string;
  submittedAt: Date | null;
  approvedById: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function mapTimesheetResponse(row: TimesheetRow): TimesheetResponseDto {
  return {
    id: row.id,
    timesheetId: row.timesheetId,
    employeeId: row.employeeId,
    periodStart: row.periodStart.toISOString().slice(0, 10),
    periodEnd: row.periodEnd.toISOString().slice(0, 10),
    trackedDays: row.trackedDays,
    workedDays: row.workedDays,
    leaveDays: Number(row.leaveDays),
    absenceDays: Number(row.absenceDays),
    remoteDays: row.remoteDays,
    lateCount: row.lateCount,
    earlyDepartureCount: row.earlyDepartureCount,
    totalWorkedMinutes: row.totalWorkedMinutes,
    overtimeMinutes: row.overtimeMinutes,
    attendanceRate: Number(row.attendanceRate),
    punctualityRate: Number(row.punctualityRate),
    sourceSnapshot: Array.isArray(row.sourceSnapshot)
      ? (row.sourceSnapshot as TimesheetResponseDto['sourceSnapshot'])
      : [],
    notes: row.notes,
    status: row.status,
    submittedAt: row.submittedAt?.toISOString() ?? null,
    approvedById: row.approvedById,
    approvedAt: row.approvedAt?.toISOString() ?? null,
    rejectionReason: row.rejectionReason,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
