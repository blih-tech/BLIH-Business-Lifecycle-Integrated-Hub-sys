import type { WorkflowStatus } from './internal-transfer.js';

export type SalaryAdjustmentReason =
  | 'MERIT'
  | 'EQUITY'
  | 'PROMOTION'
  | 'TRANSFER'
  | 'RETENTION'
  | 'MARKET';

export interface SalaryAdjustmentRequestResponseDto {
  id: string;
  requestId: string;
  employeeId: string;
  proposedById: string;
  linkedReviewId: string | null;
  linkedTransferRequestId: string | null;
  reason: SalaryAdjustmentReason;
  currentBaseSalary: number | null;
  proposedBaseSalary: number;
  percentChange: number;
  currency: string | null;
  effectiveFrom: string;
  justification: unknown;
  status: WorkflowStatus;
  submittedAt: string | null;
  approvedById: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalaryAdjustmentRequestDto {
  employeeId: string;
  proposedById: string;
  linkedReviewId?: string | null;
  linkedTransferRequestId?: string | null;
  reason: SalaryAdjustmentReason;
  proposedBaseSalary: number;
  currency?: string | null;
  effectiveFrom: string;
  justification?: unknown;
  submit?: boolean;
}

export interface UpdateSalaryAdjustmentRequestDto {
  linkedReviewId?: string | null;
  linkedTransferRequestId?: string | null;
  reason?: SalaryAdjustmentReason;
  proposedBaseSalary?: number;
  currency?: string | null;
  effectiveFrom?: string;
  justification?: unknown;
}

export interface RejectSalaryAdjustmentRequestDto {
  rejectionReason: string;
}

export interface ApproveSalaryAdjustmentRequestDto {
  approvedById: string;
  approvedAt?: string | null;
  changeReason?: string | null;
}
