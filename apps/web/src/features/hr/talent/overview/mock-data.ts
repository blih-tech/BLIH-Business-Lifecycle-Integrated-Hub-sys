import type {
  DisciplineRateSnapshot,
  HotDisciplineIssue,
  TalentApprovalRequest,
  TalentOverviewStat,
} from "@/features/hr/talent/overview/types";

export const pendingApprovalRequests: TalentApprovalRequest[] = [
  {
    id: "request-1",
    initials: "JS",
    name: "John Smith",
    department: "Engineering",
    priority: "medium",
    requestType: "Promotion Request",
    title: "Advanced Cloud Architecture certification",
    dueDate: "2024-02-28",
  },
  {
    id: "request-2",
    initials: "ER",
    name: "Emily Rodriguez",
    department: "Analytics",
    priority: "medium",
    requestType: "Promotion Request",
    title: "Advanced Cloud Architecture certification",
    dueDate: "2024-02-28",
  },
  {
    id: "request-3",
    initials: "JS",
    name: "John Smith",
    department: "Engineering",
    priority: "medium",
    requestType: "Promotion Request",
    title: "Advanced Cloud Architecture certification",
    dueDate: "2024-02-28",
  },
  {
    id: "request-4",
    initials: "ER",
    name: "Emily Rodriguez",
    department: "Analytics",
    priority: "medium",
    requestType: "Promotion Request",
    title: "Advanced Cloud Architecture certification",
    dueDate: "2024-02-28",
  },
];

export const overviewStats: TalentOverviewStat[] = [
  { id: "active-career-paths", label: "Active Career Paths", value: "156", icon: "career" },
  { id: "training-programs", label: "Training Programs", value: "24", icon: "training" },
  { id: "culture-initiatives", label: "Culture Initiatives", value: "8", icon: "culture" },
  { id: "pending-actions", label: "Pending Actions", value: "4", icon: "pending" },
];

export const hotDisciplineIssue: HotDisciplineIssue = {
  issue: "Late Arrivals",
  subtitle: "Most frequent issue this month",
  monthlyCases: 12,
  totalCases: 28,
  resolved: 18,
  trend: "+25%",
};

export const disciplineRateSnapshot: DisciplineRateSnapshot = {
  averageRate: "3.2%",
  pendingCases: 10,
  resolvedCases: 18,
};
