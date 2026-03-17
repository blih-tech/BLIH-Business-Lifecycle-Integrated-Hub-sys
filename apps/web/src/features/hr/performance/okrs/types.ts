export type OkrSummaryStat = {
  id: string;
  label: string;
  value: string;
  icon: "target" | "trending-up";
};

export type OkrProgressItem = {
  id: string;
  label: string;
  value: number;
};

export type OkrItem = {
  id: string;
  department: string;
  status: "On Track" | "At Risk";
  title: string;
  owner: string;
  dateRange: string;
  overallScore: number;
  expanded?: boolean;
  keyResults: OkrProgressItem[];
  keyImpacts: string[];
  aiSummary: string;
};
