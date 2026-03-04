import type { AssetProvisioningResponseDto } from '@repo/types';

type AssetProvisioningRow = {
  id: string;
  employeeId: string;
  equipment: unknown;
  platformPermissions: unknown;
  itSupervisorApprovedAt: Date | null;
  adminApprovedAt: Date | null;
  financeApprovalRequired: boolean;
  status: 'PENDING' | 'APPROVED' | 'PROVISIONED' | 'REJECTED' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
};

export function mapAssetProvisioningResponse(
  row: AssetProvisioningRow,
): AssetProvisioningResponseDto {
  return {
    id: row.id,
    employeeId: row.employeeId,
    equipment: row.equipment,
    platformPermissions: row.platformPermissions,
    itSupervisorApprovedAt: row.itSupervisorApprovedAt?.toISOString() ?? null,
    adminApprovedAt: row.adminApprovedAt?.toISOString() ?? null,
    financeApprovalRequired: row.financeApprovalRequired,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
