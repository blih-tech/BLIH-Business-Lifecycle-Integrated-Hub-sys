export type RecruitmentStatItem = {
  id: string;
  label: string;
  value: string;
  icon: 'clock-3' | 'circle-check-big' | 'user-round-plus';
};

export type MonthlyFrequencyPoint = {
  month: string;
  count: number;
};

export type DailyAreaPoint = {
  day: string;
  upper: number;
  lower: number;
};
