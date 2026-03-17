import type {
  ExpenseBreakdownItem,
  ExpenseHistoryItem,
  ExpenseRequestItem,
  ExpenseStat,
  MonthlyExpensePoint,
  UnexpectedExpenseItem,
  RecentExpenseItem,
} from "@/features/hr/workforce/expense/types";

export const expenseStats: ExpenseStat[] = [
  { id: "total", label: "Total Expenses", value: "$683.7k", icon: "total" },
  { id: "pending", label: "Pending Approvals", value: "3", icon: "pending" },
  { id: "unexpected", label: "Unexpected", value: "2", icon: "unexpected" },
  { id: "month", label: "This Month", value: "$684k", icon: "month" },
];

export const expenseBreakdown: ExpenseBreakdownItem[] = [
  { id: "b0", label: "Salaries", value: 62, percent: "62%", color: "#1e66f7" },
  { id: "b1", label: "Operations", value: 12, percent: "12%", color: "#60a5fa" },
  { id: "b2", label: "Marketing", value: 9, percent: "9%", color: "#93c5fd" },
  { id: "b3", label: "Equipment", value: 7, percent: "7%", color: "#bfdbfe" },
  { id: "b4", label: "Other", value: 6, percent: "6%", color: "#dbeafe" },
  { id: "b5", label: "Misc", value: 4, percent: "4%", color: "#eff6ff" },
];

export const monthlyExpenseTrend: MonthlyExpensePoint[] = [
  { month: "Aug", amount: 600 },
  { month: "Sep", amount: 620 },
  { month: "Oct", amount: 640 },
  { month: "Nov", amount: 660 },
  { month: "Dec", amount: 675 },
  { month: "Jan", amount: 690 },
  { month: "Feb", amount: 705 },
];

export const expenseRequests: ExpenseRequestItem[] = [
  {
    id: "er-1",
    title: "Production Equipment Rental",
    priority: "high",
    department: "Engineering Department",
    amount: "$8,500",
    reason: "Temporary server capacity for load testing",
    budget: "Project Budget",
    responsible: "John Smith",
    requested: "2024-02-15",
  },
  {
    id: "er-2",
    title: "Transportation",
    priority: "medium",
    department: "Sales Team",
    amount: "$3,200",
    reason: "Client meeting travel expenses",
    budget: "Department Budget - Sales",
    responsible: "Robert Chen",
    requested: "2024-02-14",
  },
  {
    id: "er-3",
    title: "Marketing Campaign",
    priority: "high",
    department: "Marketing Department",
    amount: "$12,000",
    reason: "Q1 digital advertising campaign",
    budget: "Department Budget - Marketing",
    responsible: "Sarah Johnson",
    requested: "2024-02-13",
  },
];

export const unexpectedExpenses: UnexpectedExpenseItem[] = [
  {
    id: "ue-1",
    title: "Emergency equipment repair",
    date: "2024-02-12",
    amount: "$5,200",
    coveredBy: "Buffer Budget",
    approvedBy: "CFO",
  },
  {
    id: "ue-2",
    title: "Legal consultation fees",
    date: "2024-02-09",
    amount: "$3,800",
    coveredBy: "Buffer Budget",
    approvedBy: "CEO",
  },
];

export const recentExpenses: RecentExpenseItem[] = [
  {
    id: "re-1",
    title: "Office Supplies",
    status: "completed",
    amount: "$2,500",
    fromBudget: "Miscellaneous Budget",
    responsible: "Operations Team",
    timeframe: "Feb 2024",
    date: "2024-02-10",
    note: "Monthly office supplies restocking",
  },
  {
    id: "re-2",
    title: "Software Licenses",
    status: "completed",
    amount: "$15,000",
    fromBudget: "Department Budget - Engineering",
    responsible: "IT Department",
    timeframe: "2024",
    date: "2024-02-08",
    note: "Annual software license renewals",
  },
  {
    id: "re-3",
    title: "Team Building",
    status: "completed",
    amount: "$4,500",
    fromBudget: "Culture Building",
    responsible: "HR Department",
    timeframe: "Q1 2024",
    date: "2024-02-05",
    note: "Q1 team building event",
  },
];

export const expenseHistory: ExpenseHistoryItem[] = [
  {
    id: "eh-jan",
    monthLabel: "January 2024",
    totalExpenses: "$683,720",
    categories: [
      { id: "jan-1", label: "Salaries & Benefits", value: "$425,680" },
      { id: "jan-2", label: "Operations", value: "$125,000" },
      { id: "jan-3", label: "Marketing", value: "$65,000" },
      { id: "jan-4", label: "Equipment", value: "$35,000" },
      { id: "jan-5", label: "Other", value: "$33,040" },
    ],
  },
  {
    id: "eh-dec",
    monthLabel: "December 2023",
    totalExpenses: "$655,280",
    categories: [
      { id: "dec-1", label: "Salaries & Benefits", value: "$420,000" },
      { id: "dec-2", label: "Operations", value: "$118,000" },
      { id: "dec-3", label: "Marketing", value: "$58,000" },
      { id: "dec-4", label: "Equipment", value: "$32,000" },
      { id: "dec-5", label: "Other", value: "$27,280" },
    ],
  },
];
