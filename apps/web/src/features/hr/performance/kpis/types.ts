export type KpiSummaryStat = {
  id: string;
  label: string;
  value: string;
  icon: 'target' | 'trending-up';
};

export type KpiItem = {
  id: string;
  department: string;
  status: 'Exceeding Target' | 'Below Target';
  title: string;
  description: string;
  owner: string;
  updateCadence: string;
  currentValue: string;
  targetValue: string;
  progressToTarget: number;
  trend: number[];
  aiSummary: string;
};
