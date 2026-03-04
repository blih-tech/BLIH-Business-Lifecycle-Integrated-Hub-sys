import type {
  ChecklistTemplateTask,
  ClearanceQuickAction,
  EmployeeClearanceProgressItem,
  ExitClearanceChecklistStat,
} from '@/features/hr/exit/clearance-checklist/types';

export const exitClearanceChecklistStats: ExitClearanceChecklistStat[] = [
  {
    id: 'total-employees',
    label: 'Total Employees',
    value: '3',
    icon: 'employees',
  },
  { id: 'completed', label: 'Completed', value: '1', icon: 'completed' },
  { id: 'in-progress', label: 'In Progress', value: '1', icon: 'in-progress' },
  { id: 'pending', label: 'Pending', value: '1', icon: 'pending' },
];

export const clearanceTemplateTasks: ChecklistTemplateTask[] = [
  {
    id: 'task-1',
    order: 1,
    title: 'Resignation Letter Received & Signed',
    description: 'Official resignation letter submitted and acknowledged',
    icon: 'file',
  },
  {
    id: 'task-2',
    order: 2,
    title: 'Exit Interview Completed',
    description: 'Exit interview conducted and documented',
    icon: 'message',
  },
  {
    id: 'task-3',
    order: 3,
    title: 'Assets & Credentials Returned',
    description:
      'Company property, ID card, access cards, and equipment returned',
    icon: 'package',
  },
  {
    id: 'task-4',
    order: 4,
    title: 'Last Payment Settled',
    description: 'Final salary, benefits, and dues cleared',
    icon: 'wallet',
  },
  {
    id: 'task-5',
    order: 5,
    title: 'Experience Letter Issued',
    description: 'Official experience certificate provided',
    icon: 'certificate',
  },
  {
    id: 'task-6',
    order: 6,
    title: 'Recommendation Letter (if applicable)',
    description: 'Letter of recommendation for future employment',
    icon: 'award',
  },
];

export const employeeClearanceProgressItems: EmployeeClearanceProgressItem[] = [
  {
    id: 'employee-1',
    initials: 'MC',
    name: 'Michael Chen',
    role: 'Senior Engineer',
    department: 'Engineering',
    status: 'completed',
    lastWorkingDay: '2024-03-12',
    progressPercent: 68,
    progressTasks: '6/12 tasks',
    tasks: [
      {
        id: 'employee-1-task-1',
        title: 'Resignation Letter Received & Signed',
        meta: 'Completed on 2024-02-10 by HR Team',
        status: 'completed',
      },
      {
        id: 'employee-1-task-2',
        title: 'Exit Interview Completed',
        meta: 'Completed on 2024-02-15 by Jennifer Smith',
        status: 'completed',
      },
      {
        id: 'employee-1-task-3',
        title: 'Assets & Credentials Returned',
        meta: 'Completed on 2024-02-14 by IT Department',
        status: 'completed',
      },
      {
        id: 'employee-1-task-4',
        title: 'Last Payment Settled',
        meta: 'Completed on 2024-02-16 by Finance Team',
        status: 'completed',
      },
      {
        id: 'employee-1-task-5',
        title: 'Experience Letter Issued',
        meta: 'Completed on 2024-02-15 by HR Manager',
        status: 'completed',
      },
      {
        id: 'employee-1-task-6',
        title: 'Recommendation Letter (if applicable)',
        meta: 'Completed on 2024-02-15 by Department Head',
        status: 'completed',
      },
    ],
  },
  {
    id: 'employee-2',
    initials: 'V',
    name: 'Emily Rodriguez',
    role: 'Senior Engineer',
    department: 'Engineering',
    status: 'in-progress',
    lastWorkingDay: '2024-03-12',
    progressPercent: 68,
    progressTasks: '6/12 tasks',
    tasks: [
      {
        id: 'employee-2-task-1',
        title: 'Resignation Letter Received & Signed',
        meta: 'Completed on 2024-02-10 by HR Team',
        status: 'completed',
      },
      {
        id: 'employee-2-task-2',
        title: 'Exit Interview Completed',
        meta: 'Completed on 2024-02-15 by Jennifer Smith',
        status: 'completed',
      },
      {
        id: 'employee-2-task-3',
        title: 'Assets & Credentials Returned',
        meta: '',
        status: 'pending',
        actionLabel: 'Mark Complete',
      },
      {
        id: 'employee-2-task-4',
        title: 'Last Payment Settled',
        meta: 'Completed on 2024-02-16 by Finance Team',
        status: 'completed',
      },
      {
        id: 'employee-2-task-5',
        title: 'Experience Letter Issued',
        meta: 'In progress...',
        status: 'in-progress',
        actionLabel: 'Mark Complete',
      },
      {
        id: 'employee-2-task-6',
        title: 'Recommendation Letter (if applicable)',
        meta: 'Completed on 2024-02-15 by Department Head',
        status: 'completed',
      },
    ],
  },
];

export const clearanceQuickActions: ClearanceQuickAction[] = [
  { id: 'bulk-update', label: 'Bulk Update', icon: 'refresh' },
  { id: 'export-checklist', label: 'Export Checklist', icon: 'download' },
  { id: 'send-reminder', label: 'Send Reminder', icon: 'bell' },
  { id: 'generate-reports', label: 'Generate Reports', icon: 'chart' },
];
