import { AllPermissionSlugs } from './permissions.constants.js';

export interface RbacRoleManifestEntry {
  name: string;
  displayName: string;
  description: string;
  isSystem: boolean;
  parentRoleName?: string;
}

export interface RbacResourceCatalogEntry {
  name: string;
  description: string;
}

export const RBAC_RESOURCE_CATALOG: RbacResourceCatalogEntry[] = [
  { name: 'user', description: 'HR user account ownership' },
  { name: 'employee', description: 'Employee records' },
  { name: 'leave', description: 'Leave management' },
  { name: 'attendance', description: 'Attendance tracking' },
  {
    name: 'attendance_correction',
    description: 'Attendance correction request workflows',
  },
  { name: 'overtime', description: 'Overtime request workflows' },
  { name: 'flex_work', description: 'Flex work request workflows' },
  { name: 'punctuality', description: 'Punctuality monitoring and alerts' },
  { name: 'timesheet', description: 'Timesheet management workflows' },
  {
    name: 'attendance_report',
    description: 'Attendance and leave analytics reporting',
  },
  { name: 'hr_payroll', description: 'HR payroll operations' },
  { name: 'job', description: 'Recruitment job requisition workflows' },
  { name: 'job_approval', description: 'Recruitment job approval workflows' },
  { name: 'candidate', description: 'Recruitment candidate records' },
  {
    name: 'job_application',
    description: 'Recruitment job application workflows',
  },
  {
    name: 'interview',
    description: 'Recruitment interview scheduling and feedback',
  },
  { name: 'onboarding', description: 'Onboarding workflows' },
  { name: 'onboarding_task', description: 'Onboarding task records' },
  { name: 'probation', description: 'Probation workflows' },
  { name: 'onboarding_checklist', description: 'Onboarding checklist records' },
  { name: 'asset_provisioning', description: 'Asset provisioning workflows' },
  {
    name: 'policy_acknowledgement',
    description: 'Policy acknowledgement workflows',
  },
  { name: 'probation_plan', description: 'Probation KPI plan workflows' },
  { name: 'probation_kpi', description: 'Probation KPI management' },
  {
    name: 'probation_evaluation',
    description: 'Probation evaluation workflows',
  },
  {
    name: 'probation_confirmation',
    description: 'Probation confirmation workflows',
  },
  {
    name: 'career_development',
    description: 'Career development planning workflows',
  },
  {
    name: 'internal_transfer',
    description: 'Internal transfer and mobility workflows',
  },
  {
    name: 'salary_adjustment',
    description: 'Salary adjustment approval workflows',
  },
  {
    name: 'performance',
    description: 'Performance review management workflows',
  },
  { name: 'okr', description: 'Objective and key results workflows' },
  { name: 'relations', description: 'Employee relations workflows' },
  { name: 'offboarding', description: 'Offboarding workflows' },
  { name: 'hr_report', description: 'HR reports' },
  { name: 'invoice', description: 'Invoice management' },
  { name: 'payment', description: 'Payment tracking' },
  { name: 'budget', description: 'Budget management' },
  { name: 'expense', description: 'Expense management' },
  { name: 'purchase', description: 'Purchase orders' },
  { name: 'vendor', description: 'Vendor management' },
  { name: 'finance_payroll', description: 'Finance payroll operations' },
  { name: 'salary', description: 'Salary adjustments' },
  { name: 'finance_report', description: 'Financial reporting' },
  { name: 'audit', description: 'Finance audit logs' },
  { name: 'project', description: 'Project management' },
  { name: 'milestone', description: 'Milestone tracking' },
  { name: 'task', description: 'Task management' },
  { name: 'deliverable', description: 'Deliverable approvals' },
  { name: 'change_request', description: 'Change requests' },
  { name: 'issue', description: 'Issue tracking' },
  { name: 'risk', description: 'Risk logging' },
  { name: 'project_report', description: 'Project reports' },
  { name: 'lead', description: 'Lead management' },
  { name: 'interaction', description: 'Interaction logging' },
  { name: 'deal', description: 'Deal management' },
  { name: 'crm_client', description: 'Client records' },
  { name: 'pipeline', description: 'Pipeline management' },
  { name: 'crm_report', description: 'CRM reports' },
  { name: 'company_okr', description: 'Company-level OKRs' },
  { name: 'dept_okr', description: 'Department OKRs' },
  { name: 'personal_okr', description: 'Personal OKRs' },
  { name: 'checkin', description: 'OKR check-ins' },
  { name: 'review', description: 'Performance reviews' },
  { name: 'compensation', description: 'Compensation recommendations' },
  { name: 'okr_report', description: 'OKR reports' },
  { name: 'article', description: 'Knowledge articles' },
  { name: 'sop', description: 'Standard operating procedures' },
  { name: 'training', description: 'Training management' },
  { name: 'ai_prompt', description: 'AI prompt management' },
  { name: 'knowledge', description: 'Knowledge base feedback' },
  { name: 'brain_analytics', description: 'Brain analytics' },
  { name: 'brain_config', description: 'Brain module settings' },
  { name: 'system_config', description: 'Platform configuration' },
  { name: 'system_log', description: 'Platform logs' },
  { name: 'integration', description: 'System integrations' },
  { name: 'system_audit', description: 'System audit trail' },
  { name: 'system_role', description: 'RBAC role management' },
  { name: 'system_permission', description: 'RBAC permission management' },
  { name: 'system_resource', description: 'RBAC resource catalog management' },
  { name: 'system_realm', description: 'Realm management' },
  { name: 'system_notification', description: 'Notification management' },
  { name: 'user_profile', description: 'User personal profile records' },
  { name: 'user_employment', description: 'User employment records' },
  { name: 'user_compensation', description: 'User compensation records' },
  { name: 'department', description: 'Department catalog management' },
  { name: 'position', description: 'Position catalog management' },
  { name: 'job_grade', description: 'Job grade catalog management' },
  {
    name: 'user_compensation_history',
    description: 'User compensation history records',
  },
  { name: 'user_lifecycle', description: 'User lifecycle records' },
  { name: 'succession_plan', description: 'Succession planning records' },
  { name: 'promotion_proposal', description: 'Promotion workflow proposals' },
  { name: 'training_feedback', description: 'Training feedback records' },
  { name: 'training_analytics', description: 'Training analytics and ROI' },
  { name: 'certification', description: 'Certification lifecycle records' },
  {
    name: 'training_compliance',
    description: 'Training compliance and audit reporting',
  },
];

export const RBAC_PERMISSIONS = [...AllPermissionSlugs];

export const RBAC_ROLES: RbacRoleManifestEntry[] = [
  {
    name: 'superadmin',
    displayName: 'Super Administrator',
    description: 'Full system access',
    isSystem: true,
  },
  {
    name: 'hr',
    displayName: 'Human Resources',
    description: 'HR parent role',
    isSystem: true,
  },
  {
    name: 'hr_manager',
    displayName: 'HR Manager',
    description: 'HR manager role',
    isSystem: true,
    parentRoleName: 'hr',
  },
  {
    name: 'hr_assistant',
    displayName: 'HR Assistant',
    description: 'HR assistant role',
    isSystem: true,
    parentRoleName: 'hr',
  },
  {
    name: 'finance',
    displayName: 'Finance',
    description: 'Finance parent role',
    isSystem: true,
  },
  {
    name: 'finance_manager',
    displayName: 'Finance Manager',
    description: 'Finance manager role',
    isSystem: true,
    parentRoleName: 'finance',
  },
  {
    name: 'finance_accountant',
    displayName: 'Finance Accountant',
    description: 'Finance accountant role',
    isSystem: true,
    parentRoleName: 'finance',
  },
  {
    name: 'project_manager',
    displayName: 'Project Management',
    description: 'Project management parent role',
    isSystem: true,
  },
  {
    name: 'pm_lead',
    displayName: 'PM Lead',
    description: 'Project lead role',
    isSystem: true,
    parentRoleName: 'project_manager',
  },
  {
    name: 'pm_member',
    displayName: 'PM Member',
    description: 'Project member role',
    isSystem: true,
    parentRoleName: 'project_manager',
  },
  {
    name: 'crm_manager',
    displayName: 'CRM Management',
    description: 'CRM parent role',
    isSystem: true,
  },
  {
    name: 'crm_lead',
    displayName: 'CRM Lead',
    description: 'CRM lead role',
    isSystem: true,
    parentRoleName: 'crm_manager',
  },
  {
    name: 'crm_agent',
    displayName: 'CRM Agent',
    description: 'CRM agent role',
    isSystem: true,
    parentRoleName: 'crm_manager',
  },
  {
    name: 'brain_operator',
    displayName: 'Brain Operator',
    description: 'Brain parent role',
    isSystem: true,
  },
  {
    name: 'brain_admin',
    displayName: 'Brain Admin',
    description: 'Brain admin role',
    isSystem: true,
    parentRoleName: 'brain_operator',
  },
  {
    name: 'brain_viewer',
    displayName: 'Brain Viewer',
    description: 'Brain viewer role',
    isSystem: true,
    parentRoleName: 'brain_operator',
  },
];

export const RBAC_ROLE_NAMES = RBAC_ROLES.map((role) => role.name);

export const RBAC_ROLE_BY_NAME = new Map(
  RBAC_ROLES.map((role) => [role.name, role] as const),
);
