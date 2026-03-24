export type PayrollScheduleType = "scheduled" | "bonus" | "commission" | "overtime";

export type PayrollScheduleItem = {
  id: string;
  date: string;
  type: PayrollScheduleType;
  amount: string;
  daysLeft: string;
};

export type PayrollMetric = {
  label: string;
  value: string;
  tone?: "default" | "danger" | "success";
  highlight?: boolean;
};

export type EmployeePayrollItem = {
  id: string;
  initials: string;
  name: string;
  department: string;
  role: string;
  topMetrics: PayrollMetric[];
  bottomMetrics: PayrollMetric[];
};

export type MonthlyPaymentSummaryItem = {
  id: string;
  monthLabel: string;
  employeeCount: string;
  totalGross: string;
  totalPension: string;
  totalNet: string;
  totalTax: string;
};
