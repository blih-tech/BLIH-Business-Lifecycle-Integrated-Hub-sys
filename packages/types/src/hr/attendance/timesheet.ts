export interface TimesheetDayEntryDto {
  date: string;
  status: string;
  totalMinutes: number;
  overtimeMinutes: number;
  overtimeApproved: boolean;
  checkInAt: string | null;
  checkOutAt: string | null;
  notes: string | null;
}

export interface CreateTimesheetDto {
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  notes?: string | null;
  submit?: boolean;
}

export interface UpdateTimesheetDto {
  periodStart?: string;
  periodEnd?: string;
  notes?: string | null;
}

export interface RejectTimesheetDto {
  rejectionReason: string;
}

export interface TimesheetResponseDto {
  id: string;
  timesheetId: string;
  employeeId: string;
  periodStart: string;
  periodEnd: string;
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
  sourceSnapshot: TimesheetDayEntryDto[];
  notes: string | null;
  status: string;
  submittedAt: string | null;
  approvedById: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}
