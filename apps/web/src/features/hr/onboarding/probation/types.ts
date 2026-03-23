import type { ProgressSummaryStat } from '@/features/hr/onboarding/progress/types';

export type ProbationSummaryStat = ProgressSummaryStat & {
  icon: 'calendar' | 'trend' | 'award';
};

export type ProbationKpiMetric = {
  id: string;
  label: string;
  score: string;
  progress: number;
};

export type ProbationReviewItem = {
  id: string;
  dateLabel: string;
  dateValue: string;
  scoreLabel: string;
  scoreValue: string;
  reviewer: string;
  note?: string;
  followUpLabel?: string;
  followUpValue?: string;
};

export type ProbationEmployee = {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarText: string;
  startDate: string;
  endDate: string;
  daysRemaining: string;
  automatedScore: string;
  reviews: ProbationReviewItem[];
  kpiMetrics: ProbationKpiMetric[];
  overallScore: string;
};
