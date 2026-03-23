import type {
  DepartmentPerformance,
  DistributionSlice,
  InsightCard,
  PerformanceStatItem,
  TopEmployee,
  TrendPoint,
} from "@/features/hr/performance/overview/types";

export const performanceStats: PerformanceStatItem[] = [
  { id: "avg-team", label: "Avg Team Performance", value: "4.3/5.0", delta: "+8%", icon: "trending-up" },
  { id: "top-performers", label: "Top Performers", value: "24", delta: "+12%", icon: "star" },
  { id: "okr-completion", label: "OKR Completion", value: "87%", delta: "+5%", icon: "target" },
  { id: "avg-hours", label: "Avg Work Hours/Week", value: "42h", delta: "-2h", icon: "clock-3" },
];

export const topEmployees: TopEmployee[] = [
  { id: "emp-1", name: "Sarah Johnson", role: "Marketing", initials: "SJ", rating: 4.8, okr: 95, kpi: 92 },
  { id: "emp-2", name: "Dr. Samantha Lee", role: "Analytics", initials: "SL", rating: 4.7, okr: 92, kpi: 90 },
  { id: "emp-3", name: "John Smith", role: "Engineering", initials: "JS", rating: 4.6, okr: 90, kpi: 88 },
  { id: "emp-4", name: "Emily Martinez", role: "Design", initials: "EM", rating: 4.5, okr: 88, kpi: 87 },
];

export const distributionData: DistributionSlice[] = [
  { key: "exceeds", label: "Exceeds (4.5-5.0)", value: 35, color: "#2F6CE5" },
  { key: "meets", label: "Meets (3.5-4.4)", value: 52, color: "#5D95E2" },
  { key: "below", label: "Below (2.5-3.4)", value: 10, color: "#87B2EA" },
  { key: "needs-improvement", label: "Needs Improvement (<2.5)", value: 3, color: "#BFD4F1" },
];

export const departmentPerformance: DepartmentPerformance[] = [
  { id: "eng", name: "Engineering", employees: 45, score: 4.3 },
  { id: "mkt", name: "Marketing", employees: 28, score: 4.5 },
  { id: "des", name: "Design", employees: 32, score: 4.4 },
  { id: "sales", name: "Sales", employees: 32, score: 4.1 },
  { id: "analytics", name: "Analytics", employees: 15, score: 4.6 },
  { id: "hr", name: "HR", employees: 12, score: 4.2 },
];

export const trendData: TrendPoint[] = [
  { month: "Jan", performance: 4.1, workHours: 42 },
  { month: "Feb", performance: 4.2, workHours: 43 },
  { month: "Mar", performance: 4.0, workHours: 41 },
  { month: "Apr", performance: 4.3, workHours: 44 },
  { month: "May", performance: 4.2, workHours: 45 },
  { month: "Jun", performance: 4.3, workHours: 44 },
];

export const insightCards: InsightCard[] = [
  { id: "improved", title: "Most Improved", value: "Engineering Team", detail: "+15% this quarter", icon: "zap" },
  { id: "reviews-due", title: "Reviews Due", value: "12 This Week", detail: "3 overdue", icon: "users" },
  { id: "active-okrs", title: "Active OKRs", value: "156 Company-wide", detail: "87% on track", icon: "target" },
];
