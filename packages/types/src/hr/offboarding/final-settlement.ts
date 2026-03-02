export interface EarningsDto {
  salaryDaysWorked?: number;
  leaveEncashment?: number;
  proratedBonus?: number;
  overtime?: number;
  [k: string]: number | undefined;
}

export interface DeductionsDto {
  tax?: number;
  pension?: number;
  loanRecovery?: number;
  [k: string]: number | undefined;
}

export interface FinalSettlementResponseDto {
  id: string;
  userId: string;
  resignationId: string;
  lastWorkingDay: string;
  earnings: EarningsDto;
  deductions: DeductionsDto;
  netPayable: number;
  breakdownDocumentUrl: string | null;
  approvedById: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFinalSettlementDto {
  userId: string;
  resignationId: string;
  lastWorkingDay: string;
  breakdownDocumentUrl?: string | null;
}

export interface UpdateFinalSettlementDto {
  approvedById?: string | null;
  paidAt?: string | null;
}
