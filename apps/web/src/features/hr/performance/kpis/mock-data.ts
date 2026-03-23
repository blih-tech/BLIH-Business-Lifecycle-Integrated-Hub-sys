import type {
  KpiItem,
  KpiSummaryStat,
} from '@/features/hr/performance/kpis/types';

export const kpiSummaryStats: KpiSummaryStat[] = [
  { id: 'total', label: 'Total KPIs', value: '6', icon: 'target' },
  {
    id: 'avg-score',
    label: 'Avg Score Rate',
    value: '105%',
    icon: 'trending-up',
  },
  { id: 'exceeding', label: 'Exceeding Target', value: '3', icon: 'target' },
  { id: 'below', label: 'Below Target', value: '3', icon: 'target' },
];

const summaryText =
  'Exceptional efficiency in customer acquisition. Current CAC 15% below target indicates highly effective marketing strategies and channel optimization.';

export const kpiItems: KpiItem[] = [
  {
    id: 'kpi-1',
    department: 'Sales',
    status: 'Below Target',
    title: 'Monthly Recurring Revenue (MRR)',
    description:
      'Predictable revenue stream from subscription-based products and services',
    owner: 'Robert Chen',
    updateCadence: 'Monthly',
    currentValue: '128$',
    targetValue: '150$',
    progressToTarget: 115,
    trend: [56, 58, 59, 61, 62, 64],
    aiSummary: summaryText,
  },
  {
    id: 'kpi-2',
    department: 'Analytics',
    status: 'Below Target',
    title: 'Data Processing Speed',
    description:
      'Average time to process and generate insights from raw data sources',
    owner: 'Dr. Samantha Lee',
    updateCadence: 'Weekly',
    currentValue: '12min',
    targetValue: '15min',
    progressToTarget: 125,
    trend: [56, 58, 59, 61, 62, 64],
    aiSummary: summaryText,
  },
];
