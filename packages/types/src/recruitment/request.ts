export type RecruitmentRequestStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED';

export type RecruitmentRequestType = 'NEW' | 'REPLACEMENT';

export interface CreateRecruitmentRequestDto {
  departmentId: string;
  positionId?: string | null;
  type?: RecruitmentRequestType;
  replacementUserId?: string | null;
  rationale?: Record<string, unknown> | null;
  staffing?: Record<string, unknown> | null;
  schedule?: Record<string, unknown> | null;
}

export interface UpdateRecruitmentRequestDto {
  positionId?: string | null;
  type?: RecruitmentRequestType;
  replacementUserId?: string | null;
  rationale?: Record<string, unknown> | null;
  staffing?: Record<string, unknown> | null;
  schedule?: Record<string, unknown> | null;
}

export interface ApprovalStepDto {
  level: number;
  role: string;
  approverId?: string | null;
  status: string;
  decision?: string | null;
  comments?: string | null;
  actedAt?: string | null;
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
  replacementUserId: string | null;
  rationale: unknown;
  staffing: unknown;
  schedule: unknown;
  submittedById: string;
  submittedByEmail?: string | null;
  submittedAt: string | null;
  approvals: unknown;
  linkedJobPostingId: string | null;
  linkedUserId: string | null;
  createdAt: string;
  updatedAt: string;
}
