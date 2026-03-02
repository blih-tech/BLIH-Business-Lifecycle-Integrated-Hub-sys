type AttendanceLogRow = {
  id: string;
  userId: string;
  date: Date;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  totalMinutes: number | null;
  status: string;
  isAutoCalculated: boolean;
  overtimeMinutes: number | null;
  overtimeApproved: boolean;
  checkInMethod: string | null;
  checkOutMethod: string | null;
  checkInIp: string | null;
  checkInLocation: unknown;
  reconciledAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function mapAttendanceLogResponse(row: AttendanceLogRow) {
  return {
    id: row.id,
    userId: row.userId,
    date: row.date.toISOString().slice(0, 10),
    checkInAt: row.checkInAt?.toISOString() ?? null,
    checkOutAt: row.checkOutAt?.toISOString() ?? null,
    totalMinutes: row.totalMinutes,
    status: row.status,
    isAutoCalculated: row.isAutoCalculated,
    overtimeMinutes: row.overtimeMinutes,
    overtimeApproved: row.overtimeApproved,
    checkInMethod: row.checkInMethod,
    checkOutMethod: row.checkOutMethod,
    checkInIp: row.checkInIp,
    checkInLocation: row.checkInLocation,
    reconciledAt: row.reconciledAt?.toISOString() ?? null,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
