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
      { id: 'ongoing-recruitment', label: 'Ongoing Recruitment', href: '/dashboard/hr/recruitment/ongoing-recruitment' },
      { id: 'closed-posts', label: 'Closed Posts', href: '/dashboard/hr/recruitment/closed-posts' },
      { id: 'applicant-forms', label: 'Applicant Forms', href: '/dashboard/hr/recruitment/applicant-forms' },
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
      { id: 'directory', label: 'Directory', href: '/dashboard/hr/people/directory' },
      { id: 'org-chart', label: 'Org Chart', href: '/dashboard/hr/people/org-chart' },
      { id: 'employee-records', label: 'Employee Records', href: '/dashboard/hr/people/employee-records' },
      { id: 'contracts', label: 'Contracts', href: '/dashboard/hr/people/contracts' },
    ],
  },
  {
    id: 'attendance',
    label: 'Attendance & Leave',
    href: '/dashboard/hr/attendance/overview',
    icon: 'layout-grid',
    subItems: [
      { id: 'attendance-overview', label: 'Overview', href: '/dashboard/hr/attendance/overview' },
      { id: 'timesheets', label: 'Timesheets', href: '/dashboard/hr/attendance/timesheets' },
      { id: 'leave-requests', label: 'Leave Requests', href: '/dashboard/hr/attendance/leave-requests' },
      { id: 'calendar', label: 'Calendar', href: '/dashboard/hr/attendance/calendar' },
      { id: 'policies', label: 'Policies', href: '/dashboard/hr/attendance/policies' },
    ],
  },
  {
    id: 'performance',
    label: 'Performance',
    href: '/dashboard/hr/performance/overview',
    icon: 'sparkles',
    subItems: [
      { id: 'performance-overview', label: 'Overview', href: '/dashboard/hr/performance/overview' },
      { id: 'goals', label: 'Goals', href: '/dashboard/hr/performance/goals' },
      { id: 'reviews', label: 'Reviews', href: '/dashboard/hr/performance/reviews' },
      { id: 'feedback', label: 'Feedback', href: '/dashboard/hr/performance/feedback' },
      { id: 'improvement-plans', label: 'Improvement Plans', href: '/dashboard/hr/performance/improvement-plans' },
    ],
  },
  {
    id: 'talent',
    label: 'Talent Management',
    href: '/dashboard/hr/talent/overview',
    icon: 'graduation-cap',
    subItems: [
      { id: 'talent-overview', label: 'Overview', href: '/dashboard/hr/talent/overview' },
      { id: 'succession', label: 'Succession', href: '/dashboard/hr/talent/succession' },
      { id: 'learning', label: 'Learning', href: '/dashboard/hr/talent/learning' },
      { id: 'career-paths', label: 'Career Paths', href: '/dashboard/hr/talent/career-paths' },
      { id: 'skills-matrix', label: 'Skills Matrix', href: '/dashboard/hr/talent/skills-matrix' },
    ],
  },
  {
    id: 'exit',
    label: 'Exit & Off boarding',
    href: '/dashboard/hr/exit/overview',
    icon: 'log-out',
    subItems: [
      { id: 'exit-overview', label: 'Overview', href: '/dashboard/hr/exit/overview' },
      { id: 'resignations', label: 'Resignations', href: '/dashboard/hr/exit/resignations' },
      { id: 'interviews', label: 'Interviews', href: '/dashboard/hr/exit/interviews' },
      { id: 'clearance', label: 'Clearance', href: '/dashboard/hr/exit/clearance' },
      { id: 'final-settlement', label: 'Final Settlement', href: '/dashboard/hr/exit/final-settlement' },
    ],
  },
  {
    id: 'workforce',
    label: 'Workforce Finance',
    href: '/dashboard/hr/workforce/overview',
    icon: 'building-2',
    subItems: [
      { id: 'workforce-overview', label: 'Overview', href: '/dashboard/hr/workforce/overview' },
      { id: 'payroll', label: 'Payroll', href: '/dashboard/hr/workforce/payroll' },
      { id: 'budget', label: 'Budget', href: '/dashboard/hr/workforce/budget' },
      { id: 'compensation', label: 'Compensation', href: '/dashboard/hr/workforce/compensation' },
      { id: 'cost-analysis', label: 'Cost Analysis', href: '/dashboard/hr/workforce/cost-analysis' },
    ],
  },
];
