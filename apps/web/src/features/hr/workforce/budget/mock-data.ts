import type {
  AnnualBudgetItem,
  BudgetAllocationItem,
  BudgetStat,
  DepartmentBudgetPoint,
} from '@/features/hr/workforce/budget/types';

export const budgetStats: BudgetStat[] = [
  {
    id: 'allocated',
    label: 'Total Allocated',
    value: '$1.79M',
    icon: 'allocated',
  },
  { id: 'spent', label: 'Total Spent', value: '$1.25M', icon: 'spent' },
  { id: 'remaining', label: 'Remaining', value: '$0.55M', icon: 'remaining' },
  {
    id: 'utilization',
    label: 'Utilization',
    value: '69.6%',
    icon: 'utilization',
  },
];

export const departmentBudgetPoints: DepartmentBudgetPoint[] = [
  { department: 'Engineering', allocated: 850, spent: 720 },
  { department: 'Marketing', allocated: 450, spent: 410 },
  { department: 'Sales', allocated: 420, spent: 390 },
  { department: 'Design', allocated: 300, spent: 260 },
  { department: 'Analytics', allocated: 360, spent: 320 },
  { department: 'HR', allocated: 260, spent: 230 },
];

export const budgetAllocations: BudgetAllocationItem[] = [
  {
    id: 'ba-1',
    title: 'Project Budget',
    period: 'Q1 2024',
    description:
      'Development of new product features and infrastructure upgrades',
    tags: ['Engineering', 'Product', 'Design'],
    allocated: '$850,000',
    spent: '$625,000',
    remaining: '$225,000',
    utilization: '73.5%',
    utilizationValue: 73.5,
  },
  {
    id: 'ba-2',
    title: 'Culture Building',
    period: 'Q1 2024',
    description:
      'Development of new product features and infrastructure upgrades',
    tags: ['Engineering', 'Product', 'Design'],
    allocated: '$850,000',
    spent: '$625,000',
    remaining: '$225,000',
    utilization: '73.5%',
    utilizationValue: 73.5,
  },
  {
    id: 'ba-3',
    title: 'Project Budget',
    period: 'Q1 2024',
    description:
      'Development of new product features and infrastructure upgrades',
    tags: ['Engineering', 'Product', 'Design'],
    allocated: '$850,000',
    spent: '$625,000',
    remaining: '$225,000',
    utilization: '73.5%',
    utilizationValue: 73.5,
  },
  {
    id: 'ba-4',
    title: 'Culture Building',
    period: 'Q1 2024',
    description:
      'Development of new product features and infrastructure upgrades',
    tags: ['Engineering', 'Product', 'Design'],
    allocated: '$850,000',
    spent: '$625,000',
    remaining: '$225,000',
    utilization: '73.5%',
    utilizationValue: 73.5,
  },
];

export const annualBudgets: AnnualBudgetItem[] = [
  {
    id: 'ab-1',
    yearLabel: 'Year 2022',
    variance: 'Variance: Under by $220,000',
    totalBudget: '$7.20M',
    totalAllocated: '$7.20M',
    totalSpent: '$6.98M',
    breakdown: [
      {
        id: 'ab-1-eng',
        department: 'Engineering',
        allocated: '$2100k',
        spent: '$2050k',
      },
      {
        id: 'ab-1-mkt',
        department: 'Marketing',
        allocated: '$950k',
        spent: '$920k',
      },
      {
        id: 'ab-1-sales',
        department: 'Sales',
        allocated: '$1300k',
        spent: '$1280k',
      },
    ],
  },
  {
    id: 'ab-2',
    yearLabel: 'Year 2022',
    variance: 'Variance: Under by $220,000',
    totalBudget: '$7.20M',
    totalAllocated: '$7.20M',
    totalSpent: '$6.98M',
    breakdown: [
      {
        id: 'ab-2-eng',
        department: 'Engineering',
        allocated: '$2100k',
        spent: '$2050k',
      },
      {
        id: 'ab-2-mkt',
        department: 'Marketing',
        allocated: '$950k',
        spent: '$920k',
      },
      {
        id: 'ab-2-sales',
        department: 'Sales',
        allocated: '$1300k',
        spent: '$1280k',
      },
    ],
  },
];
