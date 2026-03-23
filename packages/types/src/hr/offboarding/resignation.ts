export type ResignationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'NOTICE_PERIOD'
  | 'HANDOVER'
  | 'EXIT_PENDING'
  | 'COMPLETED';

export interface ResignationResponseDto {
  id: string;
  employeeId: string;
  proposedLastDay: string;
  actualLastDay: string | null;
  reason: string | null;
  reasonNotes: string | null;
  submittedAt: string | null;
  approvedById: string | null;
  status: ResignationStatus;
  handoverPlan: unknown;
  criticalProjectsWarning: unknown;
  leaveBalanceOptions: unknown;
  validationResult: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResignationDto {
  employeeId: string;
  proposedLastDay: string;
  reason?: string | null;
  reasonNotes?: string | null;
  handoverPlan?: unknown;
  leaveBalanceOptions?: unknown;
}

export interface UpdateResignationDto {
  actualLastDay?: string | null;
  approvedById?: string | null;
  status?: ResignationStatus;
  handoverPlan?: unknown;
}

export interface ValidateResignationResultDto {
  valid: boolean;
  warnings: Array<{ code: string; message: string; [k: string]: unknown }>;
  errors: Array<{
    code: string;
    message: string;
    requires_waiver?: boolean;
    waiver_approvers?: string[];
    [k: string]: unknown;
  }>;
  requiredNoticeDays?: number;
  actualNoticeDays?: number;
}
