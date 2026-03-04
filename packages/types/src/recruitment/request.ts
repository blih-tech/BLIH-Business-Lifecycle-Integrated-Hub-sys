export type RecruitmentRequestStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED';

export type RecruitmentRequestType = 'NEW' | 'REPLACEMENT';
export type ApprovalDecision = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CreateRecruitmentRequestDto {
  departmentId: string;
  positionId?: string | null;
  type?: RecruitmentRequestType;
  replacementEmployeeId?: string | null;
  rationale?: Record<string, unknown> | null;
  staffing?: Record<string, unknown> | null;
  schedule?: Record<string, unknown> | null;
}

export interface UpdateRecruitmentRequestDto {
  positionId?: string | null;
  type?: RecruitmentRequestType;
  replacementEmployeeId?: string | null;
  rationale?: Record<string, unknown> | null;
  staffing?: Record<string, unknown> | null;
  schedule?: Record<string, unknown> | null;
}

export interface ApprovalStepDto {
  level: number;
  role: string;
  approverId?: string | null;
  decision: ApprovalDecision;
  comments?: string | null;
  decidedAt?: string | null;
}

export interface RecruitmentRequestResponseDto {
  id: string;
  requestId: string;
  departmentId: string;
  departmentName?: string | null;
  positionId: string | null;
  positionTitle?: string | null;
  type: RecruitmentRequestType;
  status: RecruitmentRequestStatus;
  replacementEmployeeId: string | null;
  rationale: unknown;
  staffing: unknown;
  schedule: unknown;
  submittedById: string;
  submittedByEmail?: string | null;
  submittedAt: string | null;
  approvals: ApprovalStepDto[];
  linkedJobPostingId: string | null;
  linkedEmployeeId: string | null;
  createdAt: string;
  updatedAt: string;
}
