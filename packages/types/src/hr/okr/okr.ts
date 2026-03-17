export type OkrStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'AT_RISK'
  | 'DELAYED'
  | 'ACHIEVED'
  | 'PARTIALLY_ACHIEVED'
  | 'MISSED'
  | 'COMPLETED';

export type KeyResultType = 'NUMERIC' | 'PERCENTAGE' | 'BOOLEAN' | 'MILESTONE';

export type KeyResultStatus =
  | 'NOT_STARTED'
  | 'ON_TRACK'
  | 'AT_RISK'
  | 'DELAYED'
  | 'ACHIEVED';

export type OkrScope = 'COMPANY' | 'DEPARTMENT' | 'USER';

export interface KeyResultResponseDto {
  id: string;
  okrId: string;
  title: string;
  type: KeyResultType;
  targetValue: number;
  currentValue: number | null;
  progress: number;
  status: KeyResultStatus;
  weight: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface KeyResultUpdateResponseDto {
  id: string;
  keyResultId: string;
  previousValue: number | null;
  newValue: number;
  comment: string | null;
  updatedById: string;
  createdAt: string;
}

export interface OkrResponseDto {
  id: string;
  employeeId: string | null;
  scope: OkrScope;
  departmentId: string | null;
  departmentName?: string | null;
  parentOkrId: string | null;
  periodYear: number;
  periodQuarter: number;
  title: string;
  description: string | null;
  status: OkrStatus;
  overallProgress: number;
  overallStatus: OkrStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  keyResults?: KeyResultResponseDto[];
}

export interface CreateOkrDto {
  employeeId?: string | null;
  scope: OkrScope;
  departmentId?: string | null;
  parentOkrId?: string | null;
  periodYear: number;
  periodQuarter: number;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  keyResults?: CreateKeyResultDto[];
}

export interface CreateKeyResultDto {
  title: string;
  type: KeyResultType;
  targetValue: number;
  currentValue?: number | null;
  weight?: number;
  sortOrder?: number;
}

export interface UpdateOkrDto {
  title?: string;
  description?: string | null;
  status?: OkrStatus;
  departmentId?: string | null;
  startDate?: string;
  endDate?: string;
}

export interface UpdateKeyResultDto {
  title?: string;
  currentValue?: number | null;
  sortOrder?: number;
  updatedById?: string;
  comment?: string | null;
}

export interface ReweightKeyResultsDto {
  weights: Array<{
    keyResultId: string;
    weight: number;
  }>;
}

export type OkrManagerReviewDecision = 'APPROVED' | 'CHANGES_REQUESTED';

export interface OkrManagerReviewResponseDto {
  id: string;
  okrId: string;
  reviewerId: string;
  decision: OkrManagerReviewDecision;
  overallConfidence: number | null;
  comments: string | null;
  strengths: string[] | null;
  risks: string[] | null;
  supportActions: string[] | null;
  reviewedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertOkrManagerReviewDto {
  reviewerId: string;
  decision: OkrManagerReviewDecision;
  overallConfidence?: number | null;
  comments?: string | null;
  strengths?: string[] | null;
  risks?: string[] | null;
  supportActions?: string[] | null;
  reviewedAt?: string | null;
}

export interface OkrProgressResponseDto {
  okrId: string;
  overallProgress: number;
  overallStatus: OkrStatus;
  keyResults: Array<{
    id: string;
    title: string;
    progress: number;
    status: KeyResultStatus;
    weight: number;
  }>;
}
