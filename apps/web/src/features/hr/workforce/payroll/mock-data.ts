import type {
  EmployeePayrollItem,
  MonthlyPaymentSummaryItem,
  PayrollScheduleItem,
} from "@/features/hr/workforce/payroll/types";

export const payrollScheduleItems: PayrollScheduleItem[] = [
  { id: "ps-1", date: "Feb 25", type: "scheduled", amount: "$425,680", daysLeft: "2 days left" },
  { id: "ps-2", date: "Feb 26", type: "bonus", amount: "$98,450", daysLeft: "3 days left" },
  { id: "ps-3", date: "Feb 27", type: "commission", amount: "$124,780", daysLeft: "4 days left" },
  { id: "ps-4", date: "Feb 28", type: "overtime", amount: "$32,960", daysLeft: "5 days left" },
];

export const employeePayrollItems: EmployeePayrollItem[] = [
  {
    id: "ep-1",
    initials: "JS",
    name: "Sarah Johnson",
    department: "Engineering",
    role: "Lead Engineer",
    topMetrics: [
      { label: "Base Salary", value: "$110,000" },
      { label: "Pension", value: "$550", tone: "success" },
      { label: "Monthly Gross", value: "$9,167" },
    ],
    bottomMetrics: [
      { label: "Tax", value: "$2,292", tone: "danger" },
      { label: "Net Pay", value: "$6,325", highlight: true },
    ],
  },
  {
    id: "ep-2",
    initials: "ER",
    name: "Emily Rodriguez",
    department: "Marketing",
    role: "Senior Specialist",
    topMetrics: [
      { label: "Base Salary", value: "$92,000" },
      { label: "Pension", value: "$460", tone: "success" },
      { label: "Monthly Gross", value: "$7,667" },
    ],
    bottomMetrics: [
      { label: "Tax", value: "$1,917", tone: "danger" },
      { label: "Net Pay", value: "$5,290", highlight: true },
    ],
  },
  {
    id: "ep-3",
    initials: "MC",
    name: "Michael Chen",
    department: "Sales",
    role: "Account Manager",
    topMetrics: [
      { label: "Base Salary", value: "$86,000" },
      { label: "Pension", value: "$430", tone: "success" },
      { label: "Monthly Gross", value: "$7,167" },
    ],
    bottomMetrics: [
      { label: "Tax", value: "$1,792", tone: "danger" },
      { label: "Net Pay", value: "$4,945", highlight: true },
    ],
  },
];

export const monthlyPaymentSummaries: MonthlyPaymentSummaryItem[] = [
  {
    id: "mps-1",
    monthLabel: "January 2024",
    employeeCount: "142 employees",
    totalGross: "$1,184,600",
    totalPension: "$59,230",
    totalNet: "$812,740",
    totalTax: "$312,630",
  },
  {
    id: "mps-2",
    monthLabel: "February 2024",
    employeeCount: "142 employees",
    totalGross: "$1,206,340",
    totalPension: "$60,317",
    totalNet: "$827,580",
    totalTax: "$318,443",
  },
  {
    id: "mps-3",
    monthLabel: "March 2024",
    employeeCount: "142 employees",
    totalGross: "$1,223,820",
    totalPension: "$61,191",
    totalNet: "$839,480",
    totalTax: "$323,149",
  },
];
