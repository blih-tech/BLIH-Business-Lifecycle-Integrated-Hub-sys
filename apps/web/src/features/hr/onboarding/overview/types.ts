export type OnboardingSummaryStat = {
  id: string;
  label: string;
  value: string;
  icon: 'users' | 'check-circle' | 'clock-3';
};

export type WorkHoursStat = {
  id: string;
  label: string;
  value: string;
  target: string;
  performance: string;
  icon: 'clock-3' | 'calendar-days' | 'trending-up';
};

export type ChecklistStat = {
  id: string;
  label: string;
  value: string;
  icon: 'square-check-big' | 'calendar-days';
};

export type JobFrequencyPoint = {
  month: string;
  applications: number;
};
