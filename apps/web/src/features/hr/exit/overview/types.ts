export type ExitOverviewStat = {
  id: string;
  label: string;
  value: string;
  badge: string;
  icon: "active" | "interview" | "clearance" | "completed";
  badgeTone?: "primary" | "neutral" | "danger";
};

export type ResignationNotification = {
  id: string;
  initials: string;
  name: string;
  department: string;
  priority: "low" | "high" | "urgent";
  summary: string;
  date: string;
  remaining: string;
};

export type ActiveResignation = {
  id: string;
  initials: string;
  name: string;
  department: string;
  role: string;
  resignationDate: string;
  lastWorkingDay: string;
  daysRemaining: string;
  status: "interview pending" | "clearance progress" | "documents pending";
};

export type ResignationTrendPoint = {
  month: string;
  exits: number;
  hires: number;
};

export type DepartmentAttritionItem = {
  id: string;
  name: string;
  employees: number;
  attritionRate: string;
  exitsThisYear: number;
  remaining: number;
};

export type ExitReasonItem = {
  id: string;
  label: string;
  value: number;
};
