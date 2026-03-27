export type TalentApprovalRequest = {
  id: string;
  initials: string;
  name: string;
  department: string;
  priority: "low" | "medium" | "high";
  requestType: string;
  title: string;
  dueDate: string;
};

export type TalentOverviewStat = {
  id: string;
  label: string;
  value: string;
  icon: "career" | "training" | "culture" | "pending";
};

export type HotDisciplineIssue = {
  issue: string;
  subtitle: string;
  monthlyCases: number;
  totalCases: number;
  resolved: number;
  trend: string;
};

export type DisciplineRateSnapshot = {
  averageRate: string;
  pendingCases: number;
  resolvedCases: number;
};
