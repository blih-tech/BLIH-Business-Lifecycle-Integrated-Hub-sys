export type ExitClearanceChecklistStat = {
  id: string;
  label: string;
  value: string;
  icon: "employees" | "completed" | "in-progress" | "pending";
};

export type ChecklistTemplateTask = {
  id: string;
  order: number;
  title: string;
  description: string;
  icon: "file" | "message" | "package" | "wallet" | "certificate" | "award";
};

export type EmployeeClearanceTask = {
  id: string;
  title: string;
  meta: string;
  status: "completed" | "in-progress" | "pending";
  actionLabel?: string;
};

export type EmployeeClearanceProgressItem = {
  id: string;
  initials: string;
  name: string;
  role: string;
  department: string;
  status: "completed" | "in-progress";
  lastWorkingDay: string;
  progressPercent: number;
  progressTasks: string;
  tasks: EmployeeClearanceTask[];
};

export type ClearanceQuickAction = {
  id: string;
  label: string;
  icon: "refresh" | "download" | "bell" | "chart";
};
