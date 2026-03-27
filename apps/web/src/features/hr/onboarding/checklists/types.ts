import type { ProgressSummaryStat } from "@/features/hr/onboarding/progress/types";

export type ChecklistSummaryStat = ProgressSummaryStat & {
  icon: "check-square" | "calendar";
};

export type ChecklistTemplate = {
  id: string;
  title: string;
  department: string;
  totalItems: number;
  timesUsed: number;
  createdAt: string;
  lastUsedAt: string;
  items: string[];
};
