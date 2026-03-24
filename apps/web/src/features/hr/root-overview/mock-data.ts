import type {
  RootOverviewActivityItem,
  RootOverviewPendingActionItem,
  RootOverviewStatItem,
} from '@/features/hr/root-overview/types';

export const rootOverviewStats: RootOverviewStatItem[] = [
  { id: 'pending-requests', label: 'Pending Requests', value: '12' },
  {
    id: 'active-recruitments',
    label: 'Active Recruitments',
    value: '28',
    deltaText: '-3%',
    deltaTone: 'negative',
  },
  {
    id: 'total-employees',
    label: 'Total Employees',
    value: '45',
    deltaText: '70%',
    deltaTone: 'positive',
  },
  { id: 'monthly-payroll', label: 'Monthly Payroll', value: '12' },
  { id: 'average-performance', label: 'Avg Performance', value: '2.3d' },
  { id: 'leave-requests', label: 'Leave Requests', value: '45' },
];

export const rootOverviewRecentActivities: RootOverviewActivityItem[] = [
  {
    id: 'activity-1',
    category: 'Recruitment',
    title: 'New job posted: Senior Software Engineer',
    timeAgo: '2 hours ago',
    status: 'active',
    statusTone: 'active',
  },
  {
    id: 'activity-2',
    category: 'Onboarding',
    title: '5 new employees onboarded',
    timeAgo: '4 hours ago',
    status: 'completed',
    statusTone: 'completed',
  },
  {
    id: 'activity-3',
    category: 'Performance',
    title: 'Q1 reviews completed',
    timeAgo: '1 day ago',
    status: 'completed',
    statusTone: 'completed',
  },
  {
    id: 'activity-4',
    category: 'Leave',
    title: '15 leave requests pending approval',
    timeAgo: '3 hours ago',
    status: 'pending',
    statusTone: 'pending',
  },
  {
    id: 'activity-5',
    category: 'Training',
    title: 'Leadership workshop scheduled',
    timeAgo: '5 hours ago',
    status: 'scheduled',
    statusTone: 'scheduled',
  },
];

export const rootOverviewPendingActions: RootOverviewPendingActionItem[] = [
  {
    id: 'action-1',
    category: 'Recruitment',
    description: 'Job requisitions awaiting approval',
    count: 8,
  },
  {
    id: 'action-2',
    category: 'Onboarding',
    description: 'New hires to be assigned mentors',
    count: 5,
  },
  {
    id: 'action-3',
    category: 'Leave',
    description: 'Leave requests pending approval',
    count: 15,
  },
  {
    id: 'action-4',
    category: 'Performance',
    description: 'Probation reviews due this week',
    count: 12,
  },
  {
    id: 'action-5',
    category: 'Exit',
    description: 'Exit interviews to be scheduled',
    count: 3,
  },
];
