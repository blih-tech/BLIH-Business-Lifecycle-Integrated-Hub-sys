export type CareerStatItem = {
  id: string;
  label: string;
  value: string;
  trendIcon: "up" | "down" | "up-right";
};

export type PromotionRequest = {
  id: string;
  initials: string;
  name: string;
  department: string;
  manager: string;
  submittedAt: string;
  yearsInRole: string;
  currentRole: string;
  proposedRole: string;
  salaryIncrease: string;
  status: string;
  justification: string;
};

export type SalaryAdjustmentRequest = {
  id: string;
  initials: string;
  name: string;
  department: string;
  currentSalary: string;
  requestedSalary: string;
  reason: string;
};

export type PreviousPromotionRequest = {
  id: string;
  initials: string;
  name: string;
  department: string;
  status: "approved" | "rejected";
  fromRole: string;
  toRole: string;
  approvedAt?: string;
  note?: string;
};
