export interface TrainingBudgetResponseDto {
  id: string;
  departmentId: string;
  year: number;
  totalBudget: number;
  usedYtd: number;
  perPersonAmount: number | null;
  remaining: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrUpdateTrainingBudgetDto {
  departmentId: string;
  year: number;
  totalBudget?: number;
  perPersonAmount?: number | null;
}
