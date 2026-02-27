export type DeltaTone = "positive" | "negative" | "neutral";

export type RecruitmentStatItem = {
  id: string;
  label: string;
  value: string;
  deltaText?: string;
  deltaTone?: DeltaTone;
};

export type ActivityStatusTone = "active" | "completed" | "pending" | "scheduled";

export type RecentActivityItem = {
  id: string;
  category: string;
  title: string;
  timeAgo: string;
  status: string;
  statusTone: ActivityStatusTone;
};

export type PendingActionItem = {
  id: string;
  category: string;
  description: string;
  count: number;
};
