export type PerformanceStatItem = {
  id: string;
  label: string;
  value: string;
  delta: string;
  icon: 'trending-up' | 'star' | 'target' | 'clock-3';
};

export type TopEmployee = {
  id: string;
  name: string;
  role: string;
  initials: string;
  rating: number;
  okr: number;
  kpi: number;
};

export type DistributionSlice = {
  key: string;
  label: string;
  value: number;
  color: string;
};

export type DepartmentPerformance = {
  id: string;
  name: string;
  employees: number;
  score: number;
};

export type TrendPoint = {
  month: string;
  performance: number;
  workHours: number;
};

export type InsightCard = {
  id: string;
  title: string;
  value: string;
  detail: string;
  icon: 'zap' | 'users' | 'target';
};
