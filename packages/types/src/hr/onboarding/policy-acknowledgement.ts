export interface PolicyAcknowledgementItem {
  policyId?: string;
  name?: string;
  version?: string;
  acknowledgedAt?: string;
  ipAddress?: string;
}

export interface CreatePolicyAcknowledgementDto {
  employeeId: string;
  policies?: PolicyAcknowledgementItem[];
  allAcknowledged?: boolean;
  confirmedAt?: string | null;
}

export interface PolicyAcknowledgementResponseDto {
  id: string;
  employeeId: string;
  policies: unknown;
  allAcknowledged: boolean;
  confirmedAt: string | null;
  systemAccessGrantedAt: string | null;
  verifiedById: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
