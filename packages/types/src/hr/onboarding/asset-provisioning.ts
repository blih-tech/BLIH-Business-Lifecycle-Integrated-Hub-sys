export type AssetProvisioningStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'PROVISIONED'
  | 'REJECTED'
  | 'COMPLETED';

export interface AssetProvisioningEquipmentItem {
  item?: string;
  assetId?: string;
  serialNumber?: string;
  status?: string;
  allocatedAt?: string;
}

export interface CreateAssetProvisioningDto {
  employeeId: string;
  equipment?: AssetProvisioningEquipmentItem[];
  platformPermissions?: Record<string, unknown>;
  financeApprovalRequired?: boolean;
}

export interface UpdateAssetProvisioningDto {
  equipment?: AssetProvisioningEquipmentItem[];
  platformPermissions?: Record<string, unknown>;
  itSupervisorApprovedAt?: string | null;
  adminApprovedAt?: string | null;
  financeApprovalRequired?: boolean;
  status?: AssetProvisioningStatus;
}

export interface AssetProvisioningResponseDto {
  id: string;
  employeeId: string;
  equipment: unknown;
  platformPermissions: unknown;
  itSupervisorApprovedAt: string | null;
  adminApprovedAt: string | null;
  financeApprovalRequired: boolean;
  status: AssetProvisioningStatus;
  createdAt: string;
  updatedAt: string;
}
