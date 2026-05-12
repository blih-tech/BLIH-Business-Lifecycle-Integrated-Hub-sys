import { JobPermissions } from '@repo/types/rbac/permissions.constants';

export type HrSubNavItem = {
  id: string;
  label: string;
  href: string;
  badge?: string;
  /** If set, link is shown only when the user has any of these permissions. */
  requiredAnyPermissions?: readonly string[];
};

export type HrMainNavItem = {
  id: string;
  label: string;
  href: string;
  icon:
    | 'briefcase'
    | 'users'
    | 'user-square'
    | 'layout-grid'
    | 'sparkles'
    | 'graduation-cap'
    | 'log-out'
    | 'building-2';
  badge?: string;
  subItems?: HrSubNavItem[];
};

export const HR_MAIN_NAV: HrMainNavItem[] = [
  {
    id: 'recruitment',
    label: 'Recruitment & Hiring',
    href: '/hr/recruitment/overview',
    icon: 'briefcase',
    badge: '4',
    subItems: [
      {
        id: 'overview',
        label: 'Overview',
        href: '/hr/recruitment/overview',
        badge: '4',
      },
      {
        id: 'requests',
        label: 'Requests',
        href: '/hr/recruitment/requests',
        badge: '4',
        requiredAnyPermissions: [JobPermissions.VIEW],
      },
      {
        id: 'ready-to-post',
        label: 'Ready to Post',
        href: '/hr/recruitment/ready-to-post',
        badge: '3',
      },
      {
        id: 'active-posting',
        label: 'Active Posting',
        href: '/hr/recruitment/active-posting',
      },
      {
        id: 'ongoing-recruitment',
        label: 'Interview and Shortlist',
        href: '/hr/recruitment/ongoing-recruitment',
      },
      {
        id: 'closed-posts',
        label: 'History',
        href: '/hr/recruitment/closed-posts',
      },
    ],
  },
  {
    id: 'onboarding',
    label: 'Onboarding & Probation',
    href: '/hr/onboarding/overview',
    icon: 'users',
    badge: '3',
    subItems: [
      {
        id: 'onboarding-overview',
        label: 'Overview',
        href: '/hr/onboarding/overview',
        badge: '3',
      },
      {
        id: 'onboarding-progress',
        label: 'Progress',
        href: '/hr/onboarding/progress',
      },
      {
        id: 'onboarding-contract',
        label: 'Contract',
        href: '/hr/onboarding/contract',
      },
      {
        id: 'onboarding-probation',
        label: 'Probation',
        href: '/hr/onboarding/probation',
      },
      {
        id: 'onboarding-checklists',
        label: 'Checklists',
        href: '/hr/onboarding/checklists',
      },
    ],
  },
  {
    id: 'people',
    label: 'People Profiles',
    href: '/hr/people/overview',
    icon: 'user-square',
    subItems: [
      { id: 'people-overview', label: 'Overview', href: '/hr/people/overview' },
      { id: 'people-create', label: 'Create', href: '/hr/people/create' },
      {
        id: 'people-organogram',
        label: 'Organogram',
        href: '/hr/people/organogram',
      },
      { id: 'directory', label: 'Directory', href: '/hr/people/directory' },
      { id: 'people-events', label: 'Events', href: '/hr/people/events' },
      { id: 'people-archive', label: 'Archive', href: '/hr/people/archive' },
    ],
  },
  {
    id: 'attendance',
    label: 'Attendance & Leave',
    href: '/hr/attendance/overview',
    icon: 'layout-grid',
    subItems: [
      {
        id: 'attendance-overview',
        label: 'Overview',
        href: '/hr/attendance/overview',
      },
      { id: 'check-in', label: 'Check-in', href: '/hr/attendance/check-in' },
      {
        id: 'attendance-requests',
        label: 'Requests',
        href: '/hr/attendance/requests',
      },
      { id: 'timesheet', label: 'Timesheet', href: '/hr/attendance/timesheet' },
      { id: 'leaves', label: 'Leaves', href: '/hr/attendance/leaves' },
      { id: 'overtime', label: 'Overtime', href: '/hr/attendance/overtime' },
      { id: 'memo-log', label: 'Memo Log', href: '/hr/attendance/memo-log' },
      {
        id: 'work-from-home',
        label: 'Work-from-Home',
        href: '/hr/attendance/work-from-home',
      },
    ],
  },
  {
    id: 'performance',
    label: 'Performance',
    href: '/hr/performance/overview',
    icon: 'sparkles',
    subItems: [
      {
        id: 'performance-overview',
        label: 'Overview',
        href: '/hr/performance/overview',
      },
      {
        id: 'performance-review',
        label: 'Performance Review',
        href: '/hr/performance/performance-review',
      },
      { id: 'okrs', label: 'OKRs', href: '/hr/performance/okrs' },
      { id: 'kpis', label: 'KPIs', href: '/hr/performance/kpis' },
      {
        id: 'evaluation-form',
        label: 'Evaluation Form',
        href: '/hr/performance/evaluation-form',
      },
    ],
  },
  {
    id: 'talent',
    label: 'Talent Management',
    href: '/hr/talent/overview',
    icon: 'graduation-cap',
    subItems: [
      { id: 'talent-overview', label: 'Overview', href: '/hr/talent/overview' },
      { id: 'talent-career', label: 'Career', href: '/hr/talent/career' },
      {
        id: 'talent-training-skills',
        label: 'Training & Skills',
        href: '/hr/talent/training-skills',
      },
      { id: 'talent-culture', label: 'Culture', href: '/hr/talent/culture' },
      {
        id: 'talent-discipline',
        label: 'Discipline',
        href: '/hr/talent/discipline',
      },
      {
        id: 'talent-related-forms',
        label: 'Related Forms',
        href: '/hr/talent/related-forms',
      },
    ],
  },
  {
    id: 'exit',
    label: 'Exit & Off boarding',
    href: '/hr/exit/overview',
    icon: 'log-out',
    subItems: [
      {
        id: 'exit-overview',
        label: 'Overview',
        href: '/hr/exit/overview',
        badge: '4',
      },
      {
        id: 'exit-resign',
        label: 'Resign',
        href: '/hr/exit/resign',
        badge: '4',
      },
      {
        id: 'exit-interviews',
        label: 'Interviews',
        href: '/hr/exit/interviews',
        badge: '3',
      },
      { id: 'exit-documents', label: 'Documents', href: '/hr/exit/documents' },
      {
        id: 'exit-clearance-checklist',
        label: 'Clearance Checklist',
        href: '/hr/exit/clearance-checklist',
      },
      {
        id: 'exit-related-forms',
        label: 'Related Forms',
        href: '/hr/exit/related-forms',
      },
    ],
  },
  {
    id: 'workforce',
    label: 'Workforce Finance',
    href: '/hr/workforce/overview',
    icon: 'building-2',
    subItems: [
      {
        id: 'workforce-overview',
        label: 'Overview',
        href: '/hr/workforce/overview',
      },
      { id: 'workforce-salary', label: 'Salary', href: '/hr/workforce/salary' },
      { id: 'payroll', label: 'Payroll', href: '/hr/workforce/payroll' },
      { id: 'budget', label: 'Budget', href: '/hr/workforce/budget' },
      {
        id: 'workforce-expense',
        label: 'Expense',
        href: '/hr/workforce/expense',
      },
      {
        id: 'workforce-benefits',
        label: 'Benefits',
        href: '/hr/workforce/benefits',
      },
    ],
  },
];
