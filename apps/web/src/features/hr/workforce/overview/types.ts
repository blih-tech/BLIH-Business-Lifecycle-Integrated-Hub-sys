export type WorkforceOverviewStat = {
  id: string;
  label: string;
  value: string;
  chip: string;
  icon: "clock" | "dollar" | "users";
};

export type WorkforceNotification = {
  id: string;
  title: string;
  date: string;
  tone: "blue" | "red" | "yellow" | "gray";
};

export type WorkforceApprovalPriority = "high" | "medium" | "low";

export type WorkforcePendingApproval = {
  id: string;
  title: string;
  priority: WorkforceApprovalPriority;
  employee: string;
  reason: string;
  amount: string;
  requestedDate: string;
};

export type MonthlyPayrollPoint = {
  month: string;
  amount: number;
};

export type DepartmentBudgetPoint = {
  department: string;
  allocated: number;
  spent: number;
};

export type WorkforceQuickAction = {
  id: string;
  label: string;
  icon: "payroll" | "salary" | "budget" | "expense";
};
