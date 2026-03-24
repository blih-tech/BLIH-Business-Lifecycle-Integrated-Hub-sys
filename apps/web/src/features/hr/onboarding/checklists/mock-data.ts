import type {
  ChecklistSummaryStat,
  ChecklistTemplate,
} from '@/features/hr/onboarding/checklists/types';

export const checklistSummaryStats: ChecklistSummaryStat[] = [
  {
    id: 'total-checklists',
    label: 'Total Checklists',
    value: '3',
    icon: 'check-square',
  },
  {
    id: 'total-items',
    label: 'Total Items',
    value: '37',
    icon: 'check-square',
  },
  { id: 'times-used', label: 'Times Used', value: '28', icon: 'calendar' },
];

const commonItems = [
  'Create employee profile in system',
  'Send offer letter via email',
  'Provide login credentials',
  'Schedule company policy review',
  'Set up development environment',
  '+7 more items...',
];

export const checklistTemplates: ChecklistTemplate[] = [
  {
    id: 'checklist-1',
    title: 'Software Engineer Onboarding',
    department: 'Digital Marketing Dept.',
    totalItems: 12,
    timesUsed: 8,
    createdAt: 'Dec 15, 2024',
    lastUsedAt: 'Dec 15, 2024',
    items: commonItems,
  },
  {
    id: 'checklist-2',
    title: 'Marketing Team Onboarding',
    department: 'Digital Marketing Dept.',
    totalItems: 12,
    timesUsed: 8,
    createdAt: 'Dec 15, 2024',
    lastUsedAt: 'Dec 15, 2024',
    items: commonItems,
  },
  {
    id: 'checklist-3',
    title: 'General Employee Onboarding',
    department: 'Digital Marketing Dept.',
    totalItems: 12,
    timesUsed: 8,
    createdAt: 'Dec 15, 2024',
    lastUsedAt: 'Dec 15, 2024',
    items: commonItems,
  },
];
