import type {
  PeopleChecklistStat,
  PeopleJobFrequencyPoint,
  PeopleSummaryStat,
  PeopleWorkHoursStat,
} from '@/features/hr/people/overview/types';

export const peopleSummaryStats: PeopleSummaryStat[] = [
  {
    id: 'active-onboarding',
    label: 'Active Onboarding',
    value: '12',
    icon: 'users',
  },
  {
    id: 'completed-this-month',
    label: 'Completed This Month',
    value: '28',
    icon: 'check-circle',
  },
  { id: 'on-probation', label: 'On Probation', value: '45', icon: 'clock-3' },
];

export const peopleWorkHoursStats: PeopleWorkHoursStat[] = [
  {
    id: 'daily',
    label: 'Daily',
    value: '8.5h',
    target: '8h',
    performance: '106%',
    icon: 'clock-3',
  },
  {
    id: 'monthly',
    label: 'Monthly',
    value: '168h',
    target: '160h',
    performance: '105%',
    icon: 'calendar-days',
  },
  {
    id: 'annually',
    label: 'Annually',
    value: '2016h',
    target: '1920h',
    performance: '105%',
    icon: 'trending-up',
  },
];

export const peopleJobApplicationFrequency: PeopleJobFrequencyPoint[] = [
  { month: 'Jan', applications: 125 },
  { month: 'Feb', applications: 136 },
  { month: 'Mar', applications: 148 },
  { month: 'Apr', applications: 95 },
  { month: 'May', applications: 142 },
  { month: 'Jun', applications: 136 },
  { month: 'Jul', applications: 166 },
  { month: 'Aug', applications: 112 },
  { month: 'Sep', applications: 139 },
  { month: 'Oct', applications: 145 },
  { month: 'Nov', applications: 136 },
  { month: 'Dec', applications: 102 },
];

export const peopleChecklistStats: PeopleChecklistStat[] = [
  {
    id: 'total-checklists',
    label: 'Total Checklists',
    value: '3',
    icon: 'square-check-big',
  },
  {
    id: 'total-items',
    label: 'Total Items',
    value: '37',
    icon: 'square-check-big',
  },
  { id: 'times-used', label: 'Times Used', value: '28', icon: 'calendar-days' },
];
