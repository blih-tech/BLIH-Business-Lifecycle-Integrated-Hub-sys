export type LeaveType =
  | 'ANNUAL'
  | 'SICK'
  | 'MATERNITY'
  | 'PATERNITY'
  | 'BEREAVEMENT'
  | 'UNPAID'
  | 'STUDY'
  | 'EMERGENCY'
  | 'COMPASSIONATE';

export type LeaveRequestStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface CreateLeaveRequestDto {
  userId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason?: string | null;
  description?: string | null;
  contactDuringLeave?: Record<string, unknown> | null;
  handoverDelegateId?: string | null;
  handoverNotes?: string | null;
  submit?: boolean;
}

export interface UpdateLeaveRequestDto {
  startDate?: string;
  endDate?: string;
  daysRequested?: number;
  reason?: string | null;
  description?: string | null;
  contactDuringLeave?: Record<string, unknown> | null;
  handoverDelegateId?: string | null;
  handoverNotes?: string | null;
}

export interface LeaveRequestResponseDto {
  id: string;
  requestId: string;
  userId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason: string | null;
  description: string | null;
  contactDuringLeave: unknown;
  handoverDelegateId: string | null;
  handoverNotes: string | null;
  balanceSnapshot: unknown;
  submittedAt: string | null;
  approvals: unknown;
  status: LeaveRequestStatus;
  approvedById: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalanceDto {
  leaveType: LeaveType;
  entitled: number;
  used: number;
  pending: number;
  available: number;
}

export interface RejectLeaveRequestDto {
  rejectionReason: string;
}
