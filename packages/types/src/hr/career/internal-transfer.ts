export type InternalTransferType = 'PROMOTION' | 'TRANSFER';

export type WorkflowStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface InternalTransferRequestResponseDto {
  id: string;
  requestId: string;
  employeeId: string;
  requestType: InternalTransferType;
  currentPositionId: string | null;
  targetPositionId: string;
  requestedById: string;
  reason: string;
  businessCase: unknown;
  desiredEffectiveDate: string | null;
  compensationChange: unknown;
  status: WorkflowStatus;
  submittedAt: string | null;
  approvedById: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInternalTransferRequestDto {
  employeeId: string;
  requestType: InternalTransferType;
  targetPositionId: string;
  requestedById: string;
  reason: string;
  businessCase?: unknown;
  desiredEffectiveDate?: string | null;
  compensationChange?: unknown;
  submit?: boolean;
}

export interface UpdateInternalTransferRequestDto {
  requestType?: InternalTransferType;
  targetPositionId?: string;
  reason?: string;
  businessCase?: unknown;
  desiredEffectiveDate?: string | null;
  compensationChange?: unknown;
}

export interface RejectInternalTransferRequestDto {
  rejectionReason: string;
}

export interface ApproveInternalTransferRequestDto {
  approvedById: string;
  effectiveFrom?: string | null;
  changeReason?: string | null;
}
