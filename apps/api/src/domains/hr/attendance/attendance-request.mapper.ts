type RequestWorkflowRow = {
  id: string;
  requestId: string;
  employeeId: string;
  status: string;
  submittedAt: Date | null;
  approvedById: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type AttendanceCorrectionRequestRow = RequestWorkflowRow & {
  attendanceLogId: string | null;
  date: Date;
  requestedCheckInAt: Date | null;
  requestedCheckOutAt: Date | null;
  requestedStatus: string | null;
  reason: string;
  notes: string | null;
};

type OvertimeRequestRow = RequestWorkflowRow & {
  attendanceLogId: string | null;
  date: Date;
  requestedMinutes: number;
  reason: string;
  notes: string | null;
};

type FlexWorkRequestRow = RequestWorkflowRow & {
  requestType: string;
  startDate: Date;
  endDate: Date;
  requestedStartMinute: number | null;
  requestedEndMinute: number | null;
  reason: string;
  details: unknown;
};

export function mapAttendanceCorrectionRequestResponse(
  row: AttendanceCorrectionRequestRow,
) {
  return {
    id: row.id,
    requestId: row.requestId,
    employeeId: row.employeeId,
    attendanceLogId: row.attendanceLogId,
    date: row.date.toISOString().slice(0, 10),
    requestedCheckInAt: row.requestedCheckInAt?.toISOString() ?? null,
    requestedCheckOutAt: row.requestedCheckOutAt?.toISOString() ?? null,
    requestedStatus: row.requestedStatus,
    reason: row.reason,
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

export function mapOvertimeRequestResponse(row: OvertimeRequestRow) {
  return {
    id: row.id,
    requestId: row.requestId,
    employeeId: row.employeeId,
    attendanceLogId: row.attendanceLogId,
    date: row.date.toISOString().slice(0, 10),
    requestedMinutes: row.requestedMinutes,
    reason: row.reason,
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

export function mapFlexWorkRequestResponse(row: FlexWorkRequestRow) {
  return {
    id: row.id,
    requestId: row.requestId,
    employeeId: row.employeeId,
    requestType: row.requestType,
    startDate: row.startDate.toISOString().slice(0, 10),
    endDate: row.endDate.toISOString().slice(0, 10),
    requestedStartMinute: row.requestedStartMinute,
    requestedEndMinute: row.requestedEndMinute,
    reason: row.reason,
    details: row.details,
    status: row.status,
    submittedAt: row.submittedAt?.toISOString() ?? null,
    approvedById: row.approvedById,
    approvedAt: row.approvedAt?.toISOString() ?? null,
    rejectionReason: row.rejectionReason,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
