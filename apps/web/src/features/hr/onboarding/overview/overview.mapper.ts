import type {
  ChecklistStat,
  JobFrequencyPoint,
  OnboardingSummaryStat,
  WorkHoursStat,
} from './types';

type JobApplicationFrequencyItem = { month: string; count: number };

type OverviewApiPayload = {
  activeOnboarding?: number;
  completedThisMonth?: number;
  onProbation?: number;
  workHours?: {
    daily?: string;
    dailyPerformance?: string;
    monthly?: string;
    monthlyPerformance?: string;
    annually?: string;
    annualPerformance?: string;
  };
  totalChecklists?: number;
  totalItems?: number;
  timesUsed?: number;
  jobApplicationFrequency?: JobApplicationFrequencyItem[];
};

export function mapOverview(data: OverviewApiPayload): {
  summary: OnboardingSummaryStat[];
  workHours: WorkHoursStat[];
  checklist: ChecklistStat[];
  jobFrequency: JobFrequencyPoint[];
} {
  return {
    summary: [
      {
        id: 'active-onboarding',
        label: 'Active Onboarding',
        value: String(data.activeOnboarding ?? 0),
        icon: 'users',
      },
      {
        id: 'completed-this-month',
        label: 'Completed This Month',
        value: String(data.completedThisMonth ?? 0),
        icon: 'check-circle',
      },
      {
        id: 'on-probation',
        label: 'On Probation',
        value: String(data.onProbation ?? 0),
        icon: 'clock-3',
      },
    ],

    workHours: [
      {
        id: 'daily',
        label: 'Daily',
        value: data.workHours?.daily ?? '0h',
        target: '8h',
        performance: data.workHours?.dailyPerformance ?? '0%',
        icon: 'clock-3',
      },
      {
        id: 'monthly',
        label: 'Monthly',
        value: data.workHours?.monthly ?? '0h',
        target: '160h',
        performance: data.workHours?.monthlyPerformance ?? '0%',
        icon: 'calendar-days',
      },
      {
        id: 'annually',
        label: 'Annually',
        value: data.workHours?.annually ?? '0h',
        target: '1920h',
        performance: data.workHours?.annualPerformance ?? '0%',
        icon: 'trending-up',
      },
    ],

    checklist: [
      {
        id: 'total-checklists',
        label: 'Total Checklists',
        value: String(data.totalChecklists ?? 0),
        icon: 'square-check-big',
      },
      {
        id: 'total-items',
        label: 'Total Items',
        value: String(data.totalItems ?? 0),
        icon: 'square-check-big',
      },
      {
        id: 'times-used',
        label: 'Times Used',
        value: String(data.timesUsed ?? 0),
        icon: 'calendar-days',
      },
    ],

    jobFrequency:
      data.jobApplicationFrequency?.map((item) => ({
        month: item.month,
        applications: item.count,
      })) ?? [],
  };
}
