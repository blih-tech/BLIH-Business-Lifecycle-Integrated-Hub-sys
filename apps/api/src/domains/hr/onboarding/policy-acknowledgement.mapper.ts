import type { PolicyAcknowledgementResponseDto } from '@repo/types';

type PolicyAcknowledgementRow = {
  id: string;
  employeeId: string;
  policies: unknown;
  allAcknowledged: boolean;
  confirmedAt: Date | null;
  systemAccessGrantedAt: Date | null;
  verifiedById: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export function mapPolicyAcknowledgementResponse(
  row: PolicyAcknowledgementRow,
): PolicyAcknowledgementResponseDto {
  return {
    id: row.id,
    employeeId: row.employeeId,
    policies: row.policies,
    allAcknowledged: row.allAcknowledged,
    confirmedAt: row.confirmedAt?.toISOString() ?? null,
    systemAccessGrantedAt: row.systemAccessGrantedAt?.toISOString() ?? null,
    verifiedById: row.verifiedById,
    verifiedAt: row.verifiedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
