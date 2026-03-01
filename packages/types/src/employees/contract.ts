export type ContractType = 'INITIAL' | 'RENEWAL' | 'AMENDMENT' | 'ADDENDUM';

export type ContractStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'TERMINATED'
  | 'RENEWED';

export interface CreateContractDto {
  contractType: ContractType;
  sequenceNumber: number;
  startDate: string;
  endDate?: string | null;
  trialApplies?: boolean;
  trialEndDate?: string | null;
  trialConfirmed?: boolean;
  documentUrl?: string | null;
  status?: ContractStatus;
}

export interface UpdateContractDto {
  endDate?: string | null;
  trialApplies?: boolean;
  trialEndDate?: string | null;
  trialConfirmed?: boolean;
  documentUrl?: string | null;
  status?: ContractStatus;
  syncedToFinance?: boolean;
  syncedAt?: string | null;
}

export interface ContractResponseDto {
  id: string;
  userId: string;
  contractType: ContractType;
  sequenceNumber: number;
  startDate: string;
  endDate: string | null;
  trialApplies: boolean;
  trialEndDate: string | null;
  trialConfirmed: boolean;
  documentUrl: string | null;
  status: ContractStatus;
  syncedToFinance: boolean;
  syncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
