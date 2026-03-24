import type {
  DailyAreaPoint,
  MonthlyFrequencyPoint,
  RecruitmentStatItem,
} from '@/features/hr/recruitment/overview/types';

export const recruitmentStats: RecruitmentStatItem[] = [
  {
    id: 'pending-requests',
    label: 'Pending Requests',
    value: '45',
    icon: 'clock-3',
  },
  {
    id: 'active-recruitments',
    label: 'Active Recruitments',
    value: '28',
    icon: 'circle-check-big',
  },
  {
    id: 'total-employees',
    label: 'Total Employees',
    value: '12',
    icon: 'user-round-plus',
  },
];

export const monthlyFrequencyData: MonthlyFrequencyPoint[] = [
  { month: 'Jan', count: 165 },
  { month: 'Feb', count: 168 },
  { month: 'Mar', count: 173 },
  { month: 'Apr', count: 159 },
  { month: 'May', count: 171 },
  { month: 'Jun', count: 168 },
  { month: 'Jul', count: 176 },
  { month: 'Aug', count: 162 },
  { month: 'Sep', count: 169 },
  { month: 'Oct', count: 171 },
  { month: 'Nov', count: 168 },
  { month: 'Dec', count: 161 },
];

export const dailyAreaData: DailyAreaPoint[] = [
  { day: 'Feb 20', upper: 3400, lower: 1250 },
  { day: 'Feb 21', upper: 3600, lower: 1380 },
  { day: 'Feb 22', upper: 4100, lower: 1500 },
  { day: 'Feb 23', upper: 3850, lower: 1420 },
  { day: 'Feb 24', upper: 4500, lower: 1650 },
  { day: 'Feb 25', upper: 5000, lower: 1850 },
  { day: 'Feb 26', upper: 4800, lower: 1760 },
];
