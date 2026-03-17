export type DeltaTone = "positive" | "negative" | "neutral";

export type RootOverviewStatItem = {
  id: string;
  label: string;
  value: string;
  deltaText?: string;
  deltaTone?: DeltaTone;
};

export type ActivityStatusTone = "active" | "completed" | "pending" | "scheduled";

export type RootOverviewActivityItem = {
  id: string;
  category: string;
  title: string;
  timeAgo: string;
  status: string;
  statusTone: ActivityStatusTone;
};

export type RootOverviewPendingActionItem = {
  id: string;
  category: string;
  description: string;
  count: number;
};
