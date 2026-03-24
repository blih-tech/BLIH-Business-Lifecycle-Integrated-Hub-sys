import type {
  DisciplineActionCase,
  DisciplineCase,
  DisciplineStat,
} from '@/features/hr/talent/discipline/types';

export const disciplineActionCases: DisciplineActionCase[] = [
  {
    id: 'action-1',
    initials: 'MB',
    name: 'Mike Brown',
    department: 'Design',
    issueDate: '2024-02-15',
    issueTitle: 'Attendance Issues',
    description: 'Repeated late arrivals without proper notification',
    priority: 'medium',
    score: '6.5/10',
  },
  {
    id: 'action-2',
    initials: 'DW',
    name: 'David Wilson',
    department: 'Engineering',
    issueDate: '2024-02-14',
    issueTitle: 'Policy Violation',
    description: 'Unauthorized access to sensitive systems',
    priority: 'high',
    score: '8.2/10',
  },
];

const baseDisciplineCases: DisciplineCase[] = [
  {
    id: 'case-1',
    initials: 'MB',
    name: 'Mike Brown',
    issueType: 'Attendance Issues',
    score: '6.5/10',
    scoreTone: 'primary',
  },
  {
    id: 'case-2',
    initials: 'DW',
    name: 'David Wilson',
    issueType: 'Policy Violation',
    score: '8.2/10',
    scoreTone: 'danger',
  },
  {
    id: 'case-3',
    initials: 'TA',
    name: 'Tom Anderson',
    issueType: 'Performance Issues',
    score: '5.8/10',
    scoreTone: 'neutral',
  },
  {
    id: 'case-4',
    initials: 'KP',
    name: 'Kevin Park',
    issueType: 'Insubordination',
    score: '7.3/10',
    scoreTone: 'primary',
  },
  {
    id: 'case-5',
    initials: 'KP',
    name: 'Kevin Park',
    issueType: 'Insubordination',
    score: '7.3/10',
    scoreTone: 'primary',
  },
  {
    id: 'case-6',
    initials: 'KP',
    name: 'Kevin Park',
    issueType: 'Insubordination',
    score: '7.3/10',
    scoreTone: 'primary',
  },
];

export const allDisciplineCases: DisciplineCase[] = [
  ...baseDisciplineCases,
  ...baseDisciplineCases.map((item, index) => ({
    ...item,
    id: `case-${index + 7}`,
  })),
];

export const disciplineStats: DisciplineStat[] = [
  { id: 'stat-1', label: 'Active Cases', value: '6', tone: 'danger' },
  { id: 'stat-2', label: 'Pending Review', value: '2', tone: 'primary' },
  { id: 'stat-3', label: 'Avg Severity', value: '6.5', tone: 'primary' },
  { id: 'stat-4', label: 'Issue Types', value: '4', tone: 'primary' },
];
