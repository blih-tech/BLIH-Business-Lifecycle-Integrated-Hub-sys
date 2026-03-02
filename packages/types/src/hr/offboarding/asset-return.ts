export type AssetReturnStatus = 'PENDING' | 'IT_SIGNED' | 'ADMIN_SIGNED' | 'FINANCE_SIGNED' | 'COMPLETED';

export interface AssetReturnItemDto {
  assetId: string;
  condition?: string;
  returnDate?: string;
  [k: string]: unknown;
}

export interface AssetReturnResponseDto {
  id: string;
  userId: string;
  checklistId: string;
  items: AssetReturnItemDto[] | unknown;
  depositReturn: number | null;
  damageDeductions: number | null;
  netAmount: number | null;
  itSignOffAt: string | null;
  adminSignOffAt: string | null;
  financeSignOffAt: string | null;
  status: AssetReturnStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetReturnDto {
  userId: string;
  checklistId: string;
  items?: AssetReturnItemDto[] | unknown;
  depositReturn?: number | null;
  damageDeductions?: number | null;
  netAmount?: number | null;
}

export interface UpdateAssetReturnDto {
  itSignOffAt?: boolean | null;
  adminSignOffAt?: boolean | null;
  financeSignOffAt?: boolean | null;
  status?: AssetReturnStatus;
}
