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

export type LeaveApprovalDecision = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveApprovalResponseDto {
  id: string;
  approverId: string;
  level: number;
  decision: LeaveApprovalDecision;
  comments: string | null;
  decidedAt: string | null;
  createdAt: string;
}

export interface CreateLeaveRequestDto {
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysRequested: number;
  startHalfDay?: boolean;
  endHalfDay?: boolean;
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
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysRequested: number;
  startHalfDay: boolean;
  endHalfDay: boolean;
  reason: string | null;
  description: string | null;
  contactDuringLeave: unknown;
  handoverDelegateId: string | null;
  handoverNotes: string | null;
  balanceSnapshot: unknown;
  submittedAt: string | null;
  approvalSteps: LeaveApprovalResponseDto[];
  status: LeaveRequestStatus;
  approvedById: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalanceDto {
  leaveType: LeaveType;
  year: number;
  totalDays: number;
  carriedOver: number;
  used: number;
  pending: number;
  available: number;
}

export interface RejectLeaveRequestDto {
  rejectionReason: string;
}
