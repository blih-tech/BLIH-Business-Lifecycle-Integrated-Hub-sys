import type {
  DepartmentBudgetPoint,
  MonthlyPayrollPoint,
  WorkforceNotification,
  WorkforcePendingApproval,
  WorkforceQuickAction,
  WorkforceOverviewStat,
} from "@/features/hr/workforce/overview/types";

export const workforceOverviewStats: WorkforceOverviewStat[] = [
  { id: "pending-approvals-a", label: "Pending Approvals", value: "$53,500", chip: "4 items", icon: "clock" },
  { id: "pending-approvals-b", label: "Pending Approvals", value: "$53,500", chip: "4 items", icon: "clock" },
  { id: "total-budget", label: "Total Budget", value: "$2.5M", chip: "+8%", icon: "dollar" },
  { id: "active-employees", label: "Active Employees", value: "156", chip: "+12", icon: "users" },
];

export const workforceNotifications: WorkforceNotification[] = [
  {
    id: "n1",
    title: "February payroll processing scheduled for Feb 25",
    date: "2024-02-18",
    tone: "blue",
  },
  {
    id: "n2",
    title: "4 salary adjustments pending approval",
    date: "2024-02-16",
    tone: "red",
  },
  {
    id: "n3",
    title: "Q1 budget review meeting on Feb 22",
    date: "2024-02-17",
    tone: "yellow",
  },
  {
    id: "n4",
    title: "Annual benefits enrollment opens March 1",
    date: "2024-02-15",
    tone: "gray",
  },
];

export const workforcePendingApprovals: WorkforcePendingApproval[] = [
  {
    id: "a1",
    title: "Salary Adjustment",
    priority: "high",
    employee: "Sarah Johnson",
    reason: "Annual performance increase",
    amount: "$15,000",
    requestedDate: "2024-02-15",
  },
  {
    id: "a2",
    title: "Expense Approval",
    priority: "medium",
    employee: "Sarah Johnson",
    reason: "Annual performance increase",
    amount: "$15,000",
    requestedDate: "2024-02-15",
  },
  {
    id: "a3",
    title: "Salary Adjustment",
    priority: "medium",
    employee: "Emily Davis",
    reason: "Competitive salary adjustment",
    amount: "$10,000",
    requestedDate: "2024-04-10",
  },
  {
    id: "a4",
    title: "Expense Approval",
    priority: "low",
    employee: "Emily Davis",
    reason: "Competitive salary adjustment",
    amount: "$10,000",
    requestedDate: "2024-04-10",
  },
];

export const monthlyPayrollTrend: MonthlyPayrollPoint[] = [
  { month: "Aug", amount: 360000 },
  { month: "Sep", amount: 365000 },
  { month: "Oct", amount: 372000 },
  { month: "Nov", amount: 378000 },
  { month: "Dec", amount: 392000 },
  { month: "Jan", amount: 385000 },
  { month: "Feb", amount: 390000 },
];

export const departmentBudgetUtilization: DepartmentBudgetPoint[] = [
  { department: "Marketing", allocated: 900000, spent: 720000 },
  { department: "Sales", allocated: 420000, spent: 390000 },
  { department: "Design", allocated: 400000, spent: 380000 },
  { department: "Analytics", allocated: 340000, spent: 310000 },
  { department: "HR", allocated: 280000, spent: 220000 },
];

export const workforceQuickActions: WorkforceQuickAction[] = [
  { id: "qa1", label: "Process Payroll", icon: "payroll" },
  { id: "qa2", label: "Salary Adjustments", icon: "salary" },
  { id: "qa3", label: "Budget Planning", icon: "budget" },
  { id: "qa4", label: "Expense Reports", icon: "expense" },
];
