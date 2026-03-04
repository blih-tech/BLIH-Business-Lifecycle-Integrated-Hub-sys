export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'EARLY_DEPARTURE'
  | 'ON_LEAVE'
  | 'HALF_DAY'
  | 'REMOTE'
  | 'BUSINESS_TRIP';

export interface CreateOrUpdateAttendanceLogDto {
  employeeId: string;
  date: string;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  totalMinutes?: number | null;
  status?: AttendanceStatus;
  recalculateStatus?: boolean;
  overtimeApproved?: boolean | null;
  checkInMethod?: string | null;
  checkOutMethod?: string | null;
  checkInIp?: string | null;
  checkInLocation?: Record<string, unknown> | null;
  notes?: string | null;
}

export interface AttendanceLogResponseDto {
  id: string;
  employeeId: string;
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  totalMinutes: number | null;
  status: AttendanceStatus;
  isAutoCalculated: boolean;
  overtimeMinutes: number | null;
  overtimeApproved: boolean;
  checkInMethod: string | null;
  checkOutMethod: string | null;
  checkInIp: string | null;
  checkInLocation: unknown;
  reconciledAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
