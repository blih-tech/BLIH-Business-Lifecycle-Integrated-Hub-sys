type AttendanceLogRow = {
  id: string;
  userId: string;
  date: Date;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  totalMinutes: number | null;
  status: string;
  checkInMethod: string | null;
  checkOutMethod: string | null;
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
    checkInMethod: row.checkInMethod,
    checkOutMethod: row.checkOutMethod,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
