export type BudgetStat = {
  id: string;
  label: string;
  value: string;
  icon: 'allocated' | 'spent' | 'remaining' | 'utilization';
};

export type DepartmentBudgetPoint = {
  department: string;
  allocated: number;
  spent: number;
};

export type BudgetAllocationItem = {
  id: string;
  title: string;
  period: string;
  description: string;
  tags: string[];
  allocated: string;
  spent: string;
  remaining: string;
  utilization: string;
  utilizationValue: number;
};

export type AnnualDepartmentBreakdownItem = {
  id: string;
  department: string;
  allocated: string;
  spent: string;
};

export type AnnualBudgetItem = {
  id: string;
  yearLabel: string;
  variance: string;
  totalBudget: string;
  totalAllocated: string;
  totalSpent: string;
  breakdown: AnnualDepartmentBreakdownItem[];
};
