export type SalaryStat = {
  id: string;
  label: string;
  value: string;
  icon: 'dollar' | 'trend' | 'requests';
};

export type SalaryAdjustmentRequest = {
  id: string;
  initials: string;
  name: string;
  department: string;
  performance: string;
  currentSalary: string;
  requestedSalary: string;
  increase: string;
  reason: string;
  requestedDate: string;
};

export type SalaryPerformancePoint = {
  salary: number;
  score: number;
};

export type DepartmentSalaryPoint = {
  department: string;
  average: number;
};

export type DepartmentSalarySummary = {
  id: string;
  department: string;
  employees: string;
  averageSalary: string;
  total: string;
};

export type EmployeeSalaryItem = {
  id: string;
  initials: string;
  name: string;
  department: string;
  role: string;
  annualSalary: string;
  performance: string;
  joinDate: string;
};

export type SalaryAuditLogItem = {
  id: string;
  employee: string;
  tag: string;
  detail: string;
  amountLine: string;
  date: string;
  by: string;
};
