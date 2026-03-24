import type {
  DocumentTemplateItem,
  EmployeeClearanceItem,
  ExitDocumentsStat,
  RecentlyClearedItem,
} from '@/features/hr/exit/documents/types';

export const exitDocumentsStats: ExitDocumentsStat[] = [
  {
    id: 'total-employees',
    label: 'Total Employees',
    value: '3',
    icon: 'employees',
  },
  { id: 'fully-cleared', label: 'Fully Cleared', value: '1', icon: 'cleared' },
  { id: 'in-progress', label: 'In Progress', value: '2', icon: 'progress' },
];

const clearanceDocuments = [
  { id: 'doc-1', label: 'clearance Letter' },
  { id: 'doc-2', label: 'id Card' },
  { id: 'doc-3', label: 'emergency Contact' },
  { id: 'doc-4', label: 'guarantor Info' },
  { id: 'doc-5', label: 'experience Letter' },
  { id: 'doc-6', label: 'clearance Letter' },
  { id: 'doc-7', label: 'id Card' },
  { id: 'doc-8', label: 'emergency Contact' },
  { id: 'doc-9', label: 'guarantor Info' },
  { id: 'doc-10', label: 'experience Letter' },
];

export const employeeClearanceItems: EmployeeClearanceItem[] = [
  {
    id: 'employee-clearance-1',
    initials: 'MC',
    name: 'Michael Chen',
    role: 'Senior Engineer',
    department: 'ENGINEERING',
    lastWorkingDay: '2024-03-12',
    documents: clearanceDocuments,
    progressText: '100%',
    progressTasks: '6/12 tasks',
  },
  {
    id: 'employee-clearance-2',
    initials: 'MC',
    name: 'Michael Chen',
    role: 'Senior Engineer',
    department: 'ENGINEERING',
    lastWorkingDay: '2024-03-12',
    documents: clearanceDocuments,
    progressText: '100%',
    progressTasks: '6/12 tasks',
  },
];

export const documentTemplates: DocumentTemplateItem[] = [
  {
    id: 'template-1',
    title: 'Recommendation Letter Template',
    description: 'Template for employee recommendations',
  },
  {
    id: 'template-2',
    title: 'Invoice Template',
    description: 'Template for billing clients',
  },
  {
    id: 'template-3',
    title: 'Meeting Agenda Template',
    description: 'Template for organizing meeting discussions',
  },
];

export const recentlyClearedDocuments: RecentlyClearedItem[] = [
  {
    id: 'recent-1',
    initials: 'MC',
    name: 'Michael Chen',
    clearedBy: 'Jennifer Smith',
    date: '2024-02-15',
  },
  {
    id: 'recent-2',
    initials: 'MC',
    name: 'Michael Chen',
    clearedBy: 'Jennifer Smith',
    date: '2024-02-15',
  },
  {
    id: 'recent-3',
    initials: 'MC',
    name: 'Michael Chen',
    clearedBy: 'Jennifer Smith',
    date: '2024-02-15',
  },
  {
    id: 'recent-4',
    initials: 'MC',
    name: 'Michael Chen',
    clearedBy: 'Jennifer Smith',
    date: '2024-02-15',
  },
];
