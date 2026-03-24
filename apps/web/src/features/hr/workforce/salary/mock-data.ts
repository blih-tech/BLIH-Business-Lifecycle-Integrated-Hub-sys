import type {
  DepartmentSalaryPoint,
  DepartmentSalarySummary,
  EmployeeSalaryItem,
  SalaryAdjustmentRequest,
  SalaryAuditLogItem,
  SalaryPerformancePoint,
  SalaryStat,
} from '@/features/hr/workforce/salary/types';

export const salaryStats: SalaryStat[] = [
  { id: 'avg', label: 'Avg Salary', value: '$87,450', icon: 'dollar' },
  { id: 'total', label: 'Total Payroll', value: '$13.14M', icon: 'trend' },
  { id: 'pending', label: 'Pending Requests', value: '2', icon: 'requests' },
  { id: 'increase', label: 'Avg Increase', value: '8.5%', icon: 'trend' },
];

export const salaryAdjustmentRequests: SalaryAdjustmentRequest[] = [
  {
    id: 'req-1',
    initials: 'SJ',
    name: 'Sarah Johnson',
    department: 'Marketing',
    performance: '4.7/5.0',
    currentSalary: '$85,000',
    requestedSalary: '$100,000',
    increase: '+$15,000 (17.6%)',
    reason: 'Annual performance increase + market adjustment',
    requestedDate: '2024-02-15',
  },
  {
    id: 'req-2',
    initials: 'SJ',
    name: 'Sarah Johnson',
    department: 'Marketing',
    performance: '4.7/5.0',
    currentSalary: '$85,000',
    requestedSalary: '$100,000',
    increase: '+$15,000 (17.6%)',
    reason: 'Annual performance increase + market adjustment',
    requestedDate: '2024-02-15',
  },
];

export const salaryPerformanceData: SalaryPerformancePoint[] = [
  { salary: 12000, score: 3.8 },
  { salary: 28000, score: 4.0 },
  { salary: 36000, score: 4.1 },
  { salary: 42000, score: 3.9 },
  { salary: 56000, score: 4.3 },
  { salary: 64000, score: 4.2 },
  { salary: 72000, score: 4.4 },
  { salary: 78000, score: 4.5 },
  { salary: 98000, score: 4.6 },
  { salary: 110000, score: 4.7 },
];

export const departmentSalaryData: DepartmentSalaryPoint[] = [
  { department: 'Engineering', average: 99000 },
  { department: 'Marketing', average: 78000 },
  { department: 'Sales', average: 83000 },
  { department: 'Design', average: 79000 },
  { department: 'Analytics', average: 95000 },
  { department: 'HR', average: 73000 },
];

export const departmentSalarySummaries: DepartmentSalarySummary[] = [
  {
    id: 'd1',
    department: 'Engineering',
    employees: '45 employees',
    averageSalary: '$99k',
    total: 'Total: $4.43M',
  },
  {
    id: 'd2',
    department: 'Marketing',
    employees: '28 employees',
    averageSalary: '$78k',
    total: 'Total: $2.19M',
  },
  {
    id: 'd3',
    department: 'Sales',
    employees: '32 employees',
    averageSalary: '$83k',
    total: 'Total: $2.64M',
  },
  {
    id: 'd4',
    department: 'Engineering',
    employees: '45 employees',
    averageSalary: '$99k',
    total: 'Total: $4.43M',
  },
  {
    id: 'd5',
    department: 'Marketing',
    employees: '28 employees',
    averageSalary: '$78k',
    total: 'Total: $2.19M',
  },
  {
    id: 'd6',
    department: 'Sales',
    employees: '32 employees',
    averageSalary: '$83k',
    total: 'Total: $2.64M',
  },
];

export const employeeSalaryItems: EmployeeSalaryItem[] = [
  {
    id: 'e1',
    initials: 'MC',
    name: 'Michael Chen',
    department: 'Engineering',
    role: 'Senior Engineer',
    annualSalary: '$95,000',
    performance: '4.7/5.0',
    joinDate: '2019-06-20',
  },
  {
    id: 'e2',
    initials: 'SL',
    name: 'Dr. Samantha Lee',
    department: 'Analytics',
    role: 'Analytics Director',
    annualSalary: '$125,000',
    performance: '4.8/5.0',
    joinDate: '2018-01-10',
  },
];

export const salaryAuditLogItems: SalaryAuditLogItem[] = [
  {
    id: 'a1',
    employee: 'Michael Chen',
    tag: 'Salary Adjustment',
    detail: 'Annual review',
    amountLine: '$95,000 → $110,000',
    date: '2024-02-01',
    by: 'By: HR Manager',
  },
  {
    id: 'a2',
    employee: 'Emily Rodriguez',
    tag: 'New Employee',
    detail: 'New hire',
    amountLine: '$85,000 • New hire',
    date: '2024-01-15',
    by: 'By: Department Head',
  },
  {
    id: 'a3',
    employee: 'Sarah Johnson',
    tag: 'Bonus Payment',
    detail: 'Performance bonus',
    amountLine: '$5,000 • Performance bonus',
    date: '2024-01-10',
    by: 'By: CFO',
  },
  {
    id: 'a4',
    employee: 'Michael Chen',
    tag: 'Salary Adjustment',
    detail: 'Annual review',
    amountLine: '$95,000 → $110,000',
    date: '2024-02-01',
    by: 'By: HR Manager',
  },
  {
    id: 'a5',
    employee: 'Emily Rodriguez',
    tag: 'New Employee',
    detail: 'New hire',
    amountLine: '$85,000 • New hire',
    date: '2024-01-15',
    by: 'By: Department Head',
  },
  {
    id: 'a6',
    employee: 'Sarah Johnson',
    tag: 'Bonus Payment',
    detail: 'Performance bonus',
    amountLine: '$5,000 • Performance bonus',
    date: '2024-01-10',
    by: 'By: CFO',
  },
];
