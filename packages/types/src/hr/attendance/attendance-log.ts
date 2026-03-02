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
  userId: string;
  date: string;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  totalMinutes?: number | null;
  status?: AttendanceStatus;
  checkInMethod?: string | null;
  checkOutMethod?: string | null;
  notes?: string | null;
}

export interface AttendanceLogResponseDto {
  id: string;
  userId: string;
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  totalMinutes: number | null;
  status: AttendanceStatus;
  checkInMethod: string | null;
  checkOutMethod: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
