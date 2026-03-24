import type {
  CareerStatItem,
  PreviousPromotionRequest,
  PromotionRequest,
  SalaryAdjustmentRequest,
} from '@/features/hr/talent/career/types';

export const careerStats: CareerStatItem[] = [
  {
    id: 'promoted',
    label: 'Promoted (Last 6 months)',
    value: '24',
    trendIcon: 'up',
  },
  { id: 'under-review', label: 'Under Review', value: '12', trendIcon: 'up' },
  { id: 'demoted', label: 'Demoted', value: '2', trendIcon: 'down' },
  {
    id: 'lateral-move',
    label: 'Lateral Move',
    value: '8',
    trendIcon: 'up-right',
  },
];

export const promotionRequests: PromotionRequest[] = [
  {
    id: 'pr-1',
    initials: 'SJ',
    name: 'Sarah Johnson',
    department: 'Marketing',
    manager: 'John Smith',
    submittedAt: '2024-02-10',
    yearsInRole: '3 years in role',
    currentRole: 'Marketing Specialist',
    proposedRole: 'Senior Marketing Manager',
    salaryIncrease: '$25,000',
    status: 'Pending Review',
    justification:
      'Consistently exceeded targets, demonstrated strong leadership, and successfully led 5 major campaigns',
  },
  {
    id: 'pr-2',
    initials: 'SJ',
    name: 'Michael Chen',
    department: 'Engineering',
    manager: 'John Smith',
    submittedAt: '2024-02-10',
    yearsInRole: '3 years in role',
    currentRole: 'Senior Developer',
    proposedRole: 'Staff Engineer',
    salaryIncrease: '$25,000',
    status: 'Pending Review',
    justification:
      'Technical excellence, mentorship of junior developers, and architectural leadership',
  },
];

export const salaryAdjustmentRequests: SalaryAdjustmentRequest[] = [
  {
    id: 'sa-1',
    initials: 'ER',
    name: 'Emily Rodriguez',
    department: 'Analytics',
    currentSalary: '$95,000',
    requestedSalary: '$110,000',
    reason: 'Market adjustment and performance-based increase',
  },
  {
    id: 'sa-2',
    initials: 'ER',
    name: 'Emily Rodriguez',
    department: 'Analytics',
    currentSalary: '$95,000',
    requestedSalary: '$110,000',
    reason: 'Market adjustment and performance-based increase',
  },
  {
    id: 'sa-3',
    initials: 'DL',
    name: 'David Lee',
    department: 'Design',
    currentSalary: '$78,000',
    requestedSalary: '$85,000',
    reason: 'Cost of living adjustment',
  },
];

export const previousPromotionRequests: PreviousPromotionRequest[] = [
  {
    id: 'prev-1',
    initials: 'SL',
    name: 'Dr. Samantha Lee',
    department: 'Analytics',
    status: 'approved',
    fromRole: 'Senior Analyst',
    toRole: 'Analytics Director',
    approvedAt: '2024-02-01',
  },
  {
    id: 'prev-2',
    initials: 'TA',
    name: 'Tom Anderson',
    department: 'Sales',
    status: 'rejected',
    fromRole: 'Sales Representative',
    toRole: 'Sales Manager',
    note: 'Needs more experience in team leadership',
  },
  {
    id: 'prev-3',
    initials: 'TA',
    name: 'Tom Anderson',
    department: 'Sales',
    status: 'rejected',
    fromRole: 'Sales Representative',
    toRole: 'Sales Manager',
    note: 'Needs more experience in team leadership',
  },
];
