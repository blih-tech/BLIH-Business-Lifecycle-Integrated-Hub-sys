export type HrSubNavItem = {
  id: string;
  label: string;
  href: string;
  badge?: string;
};

export type HrMainNavItem = {
  id: string;
  label: string;
  href: string;
  icon: 'briefcase' | 'users' | 'user-square' | 'layout-grid' | 'sparkles' | 'graduation-cap' | 'log-out' | 'building-2';
  badge?: string;
  subItems?: HrSubNavItem[];
};

export const HR_MAIN_NAV: HrMainNavItem[] = [
  {
    id: 'recruitment',
    label: 'Recruitment & Hiring',
    href: '/dashboard/hr/recruitment/overview',
    icon: 'briefcase',
    badge: '4',
    subItems: [
      { id: 'overview', label: 'Overview', href: '/dashboard/hr/recruitment/overview', badge: '4' },
      { id: 'requests', label: 'Requests', href: '/dashboard/hr/recruitment/requests', badge: '4' },
      { id: 'ready-to-post', label: 'Ready to Post', href: '/dashboard/hr/recruitment/ready-to-post', badge: '3' },
      { id: 'active-posting', label: 'Active Posting', href: '/dashboard/hr/recruitment/active-posting' },
      { id: 'ongoing-recruitment', label: 'Interview and Shortlist', href: '/dashboard/hr/recruitment/ongoing-recruitment' },
      { id: 'closed-posts', label: 'History', href: '/dashboard/hr/recruitment/closed-posts' },
    ],
  },
  {
    id: 'onboarding',
    label: 'Onboarding & Probation',
    href: '/dashboard/hr/onboarding/overview',
    icon: 'users',
    badge: '3',
    subItems: [
      { id: 'onboarding-overview', label: 'Overview', href: '/dashboard/hr/onboarding/overview', badge: '3' },
      { id: 'onboarding-progress', label: 'Progress', href: '/dashboard/hr/onboarding/progress' },
      { id: 'onboarding-contract', label: 'Contract', href: '/dashboard/hr/onboarding/contract' },
      { id: 'onboarding-probation', label: 'Probation', href: '/dashboard/hr/onboarding/probation' },
      { id: 'onboarding-checklists', label: 'Checklists', href: '/dashboard/hr/onboarding/checklists' },
    ],
  },
  {
    id: 'people',
    label: 'People Profiles',
    href: '/dashboard/hr/people/overview',
    icon: 'user-square',
    subItems: [
      { id: 'people-overview', label: 'Overview', href: '/dashboard/hr/people/overview' },
      { id: 'people-create', label: 'Create', href: '/dashboard/hr/people/create' },
      { id: 'people-organogram', label: 'Organogram', href: '/dashboard/hr/people/organogram' },
      { id: 'directory', label: 'Directory', href: '/dashboard/hr/people/directory' },
      { id: 'people-events', label: 'Events', href: '/dashboard/hr/people/events' },
      { id: 'people-archive', label: 'Archive', href: '/dashboard/hr/people/archive' },
    ],
  },
  {
    id: 'attendance',
    label: 'Attendance & Leave',
    href: '/dashboard/hr/attendance/overview',
    icon: 'layout-grid',
    subItems: [
      { id: 'attendance-overview', label: 'Overview', href: '/dashboard/hr/attendance/overview' },
      { id: 'check-in', label: 'Check-in', href: '/dashboard/hr/attendance/check-in' },
      { id: 'attendance-requests', label: 'Requests', href: '/dashboard/hr/attendance/requests' },
      { id: 'timesheet', label: 'Timesheet', href: '/dashboard/hr/attendance/timesheet' },
      { id: 'leaves', label: 'Leaves', href: '/dashboard/hr/attendance/leaves' },
      { id: 'overtime', label: 'Overtime', href: '/dashboard/hr/attendance/overtime' },
      { id: 'memo-log', label: 'Memo Log', href: '/dashboard/hr/attendance/memo-log' },
      { id: 'work-from-home', label: 'Work-from-Home', href: '/dashboard/hr/attendance/work-from-home' },
    ],
  },
  {
    id: 'performance',
    label: 'Performance',
    href: '/dashboard/hr/performance/overview',
    icon: 'sparkles',
    subItems: [
      { id: 'performance-overview', label: 'Overview', href: '/dashboard/hr/performance/overview' },
      { id: 'performance-review', label: 'Performance Review', href: '/dashboard/hr/performance/performance-review' },
      { id: 'okrs', label: 'OKRs', href: '/dashboard/hr/performance/okrs' },
      { id: 'kpis', label: 'KPIs', href: '/dashboard/hr/performance/kpis' },
      { id: 'evaluation-form', label: 'Evaluation Form', href: '/dashboard/hr/performance/evaluation-form' },
    ],
  },
  {
    id: 'talent',
    label: 'Talent Management',
    href: '/dashboard/hr/talent/overview',
    icon: 'graduation-cap',
    subItems: [
      { id: 'talent-overview', label: 'Overview', href: '/dashboard/hr/talent/overview' },
      { id: 'talent-career', label: 'Career', href: '/dashboard/hr/talent/career' },
      { id: 'talent-training-skills', label: 'Training & Skills', href: '/dashboard/hr/talent/training-skills' },
      { id: 'talent-culture', label: 'Culture', href: '/dashboard/hr/talent/culture' },
      { id: 'talent-discipline', label: 'Discipline', href: '/dashboard/hr/talent/discipline' },
      { id: 'talent-related-forms', label: 'Related Forms', href: '/dashboard/hr/talent/related-forms' },
    ],
  },
  {
    id: 'exit',
    label: 'Exit & Off boarding',
    href: '/dashboard/hr/exit/overview',
    icon: 'log-out',
    subItems: [
      { id: 'exit-overview', label: 'Overview', href: '/dashboard/hr/exit/overview', badge: '4' },
      { id: 'exit-resign', label: 'Resign', href: '/dashboard/hr/exit/resign', badge: '4' },
      { id: 'exit-interviews', label: 'Interviews', href: '/dashboard/hr/exit/interviews', badge: '3' },
      { id: 'exit-documents', label: 'Documents', href: '/dashboard/hr/exit/documents' },
      { id: 'exit-clearance-checklist', label: 'Clearance Checklist', href: '/dashboard/hr/exit/clearance-checklist' },
      { id: 'exit-related-forms', label: 'Related Forms', href: '/dashboard/hr/exit/related-forms' },
    ],
  },
  {
    id: 'workforce',
    label: 'Workforce Finance',
    href: '/dashboard/hr/workforce/overview',
    icon: 'building-2',
    subItems: [
      { id: 'workforce-overview', label: 'Overview', href: '/dashboard/hr/workforce/overview' },
      { id: 'workforce-salary', label: 'Salary', href: '/dashboard/hr/workforce/salary' },
      { id: 'payroll', label: 'Payroll', href: '/dashboard/hr/workforce/payroll' },
      { id: 'budget', label: 'Budget', href: '/dashboard/hr/workforce/budget' },
      { id: 'workforce-expense', label: 'Expense', href: '/dashboard/hr/workforce/expense' },
      { id: 'workforce-benefits', label: 'Benefits', href: '/dashboard/hr/workforce/benefits' },
    ],
  },
];
