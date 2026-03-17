import type { AttendanceStatus } from './attendance-log.js';

export type RequestWorkflowStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface CreateAttendanceCorrectionRequestDto {
  employeeId: string;
  attendanceLogId?: string | null;
  date: string;
  requestedCheckInAt?: string | null;
  requestedCheckOutAt?: string | null;
  requestedStatus?: AttendanceStatus | null;
  reason: string;
  notes?: string | null;
  submit?: boolean;
}

export interface UpdateAttendanceCorrectionRequestDto {
  requestedCheckInAt?: string | null;
  requestedCheckOutAt?: string | null;
  requestedStatus?: AttendanceStatus | null;
  reason?: string;
  notes?: string | null;
}

export interface AttendanceCorrectionRequestResponseDto {
  id: string;
  requestId: string;
  employeeId: string;
  attendanceLogId: string | null;
  date: string;
  requestedCheckInAt: string | null;
  requestedCheckOutAt: string | null;
  requestedStatus: AttendanceStatus | null;
  reason: string;
  notes: string | null;
  status: RequestWorkflowStatus;
  submittedAt: string | null;
  approvedById: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RejectAttendanceCorrectionRequestDto {
  rejectionReason: string;
}

export interface CreateOvertimeRequestDto {
  employeeId: string;
  attendanceLogId?: string | null;
  date: string;
  requestedMinutes: number;
  reason: string;
  notes?: string | null;
  submit?: boolean;
}

export interface UpdateOvertimeRequestDto {
  requestedMinutes?: number;
  reason?: string;
  notes?: string | null;
}

export interface OvertimeRequestResponseDto {
  id: string;
  requestId: string;
  employeeId: string;
  attendanceLogId: string | null;
  date: string;
  requestedMinutes: number;
  reason: string;
  notes: string | null;
  status: RequestWorkflowStatus;
  submittedAt: string | null;
  approvedById: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RejectOvertimeRequestDto {
  rejectionReason: string;
}

export type FlexWorkRequestType = 'WORK_FROM_HOME' | 'FLEX_TIME';

export interface CreateFlexWorkRequestDto {
  employeeId: string;
  requestType: FlexWorkRequestType;
  startDate: string;
  endDate: string;
  requestedStartMinute?: number | null;
  requestedEndMinute?: number | null;
  reason: string;
  details?: Record<string, unknown> | null;
  submit?: boolean;
}

export interface UpdateFlexWorkRequestDto {
  startDate?: string;
  endDate?: string;
  requestedStartMinute?: number | null;
  requestedEndMinute?: number | null;
  reason?: string;
  details?: Record<string, unknown> | null;
}

export interface FlexWorkRequestResponseDto {
  id: string;
  requestId: string;
  employeeId: string;
  requestType: FlexWorkRequestType;
  startDate: string;
  endDate: string;
  requestedStartMinute: number | null;
  requestedEndMinute: number | null;
  reason: string;
  details: unknown;
  status: RequestWorkflowStatus;
  submittedAt: string | null;
  approvedById: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RejectFlexWorkRequestDto {
  rejectionReason: string;
}

export interface PunctualityLogItemDto {
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  expectedStartMinute: number | null;
  actualCheckInAt: string | null;
  lateThresholdMinutes: number | null;
  minutesLate: number;
  totalMinutes: number | null;
}

export interface PunctualityTrendDto {
  employeeId: string;
  fromDate: string;
  toDate: string;
  totalTrackedDays: number;
  lateDays: number;
  earlyDepartureDays: number;
  absentDays: number;
  punctualityRate: number;
  averageMinutesLate: number;
}

export interface CreatePunctualityAlertDto {
  employeeId: string;
  fromDate: string;
  toDate: string;
  thresholdLateDays?: number;
  thresholdAverageLateMinutes?: number;
  notifyUserId?: string | null;
}

export interface PunctualityAlertResponseDto {
  employeeId: string;
  fromDate: string;
  toDate: string;
  thresholdLateDays: number;
  thresholdAverageLateMinutes: number;
  lateDays: number;
  averageMinutesLate: number;
  alertCreated: boolean;
  notificationId: string | null;
}
