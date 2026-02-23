import {
  AllPermissionSlugs,
  BrainConfigPermissions,
  CrmClientPermissions,
  DealPermissions,
  EmployeePermissions,
  ExpensePermissions,
  FinanceReportPermissions,
  HrPayrollPermissions,
  InvoicePermissions,
  LeavePermissions,
  PipelinePermissions,
  ProjectPermissions,
  SystemLogPermissions,
  TaskPermissions,
  UserPermissions,
} from '../../../core/rbac/constants/permissions.constants';

export type RoleDataScopeLiteral = 'GLOBAL' | 'SELF';

export interface RbacRoleManifestEntry {
  name: string;
  displayName: string;
  description: string;
  dataScope: RoleDataScopeLiteral;
  isSystem: boolean;
  parentRoleName?: string;
  permissions: string[];
}

export interface RbacResourceCatalogEntry {
  module: string;
  name: string;
  description: string;
}

export const RBAC_MODULES = [
  'system',
  'hr',
  'finance',
  'projects',
  'crm',
  'okr',
  'brain',
] as const;

export const RBAC_RESOURCE_CATALOG: RbacResourceCatalogEntry[] = [
  { module: 'hr', name: 'user', description: 'HR user account ownership' },
  { module: 'hr', name: 'employee', description: 'Employee records' },
  { module: 'hr', name: 'leave', description: 'Leave management' },
  { module: 'hr', name: 'attendance', description: 'Attendance tracking' },
  { module: 'hr', name: 'hr_payroll', description: 'HR payroll operations' },
  { module: 'hr', name: 'onboarding', description: 'Onboarding workflows' },
  { module: 'hr', name: 'probation', description: 'Probation workflows' },
  { module: 'hr', name: 'hr_report', description: 'HR reports' },
  {
    module: 'finance',
    name: 'invoice',
    description: 'Invoice management',
  },
  {
    module: 'finance',
    name: 'payment',
    description: 'Payment tracking',
  },
  { module: 'finance', name: 'budget', description: 'Budget management' },
  {
    module: 'finance',
    name: 'expense',
    description: 'Expense management',
  },
  {
    module: 'finance',
    name: 'purchase',
    description: 'Purchase orders',
  },
  {
    module: 'finance',
    name: 'vendor',
    description: 'Vendor management',
  },
  {
    module: 'finance',
    name: 'finance_payroll',
    description: 'Finance payroll operations',
  },
  {
    module: 'finance',
    name: 'salary',
    description: 'Salary adjustments',
  },
  {
    module: 'finance',
    name: 'finance_report',
    description: 'Financial reporting',
  },
  { module: 'finance', name: 'audit', description: 'Finance audit logs' },
  {
    module: 'projects',
    name: 'project',
    description: 'Project management',
  },
  {
    module: 'projects',
    name: 'milestone',
    description: 'Milestone tracking',
  },
  { module: 'projects', name: 'task', description: 'Task management' },
  {
    module: 'projects',
    name: 'deliverable',
    description: 'Deliverable approvals',
  },
  {
    module: 'projects',
    name: 'change_request',
    description: 'Change requests',
  },
  { module: 'projects', name: 'issue', description: 'Issue tracking' },
  { module: 'projects', name: 'risk', description: 'Risk logging' },
  {
    module: 'projects',
    name: 'project_report',
    description: 'Project reports',
  },
  { module: 'crm', name: 'lead', description: 'Lead management' },
  {
    module: 'crm',
    name: 'interaction',
    description: 'Interaction logging',
  },
  { module: 'crm', name: 'deal', description: 'Deal management' },
  {
    module: 'crm',
    name: 'crm_client',
    description: 'Client records',
  },
  { module: 'crm', name: 'pipeline', description: 'Pipeline management' },
  { module: 'crm', name: 'crm_report', description: 'CRM reports' },
  {
    module: 'okr',
    name: 'company_okr',
    description: 'Company-level OKRs',
  },
  { module: 'okr', name: 'dept_okr', description: 'Department OKRs' },
  { module: 'okr', name: 'personal_okr', description: 'Personal OKRs' },
  { module: 'okr', name: 'checkin', description: 'OKR check-ins' },
  { module: 'okr', name: 'review', description: 'Performance reviews' },
  {
    module: 'okr',
    name: 'compensation',
    description: 'Compensation recommendations',
  },
  { module: 'okr', name: 'okr_report', description: 'OKR reports' },
  {
    module: 'brain',
    name: 'article',
    description: 'Knowledge articles',
  },
  {
    module: 'brain',
    name: 'sop',
    description: 'Standard operating procedures',
  },
  {
    module: 'brain',
    name: 'training',
    description: 'Training management',
  },
  {
    module: 'brain',
    name: 'ai_prompt',
    description: 'AI prompt management',
  },
  {
    module: 'brain',
    name: 'knowledge',
    description: 'Knowledge base feedback',
  },
  {
    module: 'brain',
    name: 'brain_analytics',
    description: 'Brain analytics',
  },
  {
    module: 'brain',
    name: 'brain_config',
    description: 'Brain module settings',
  },
  {
    module: 'system',
    name: 'system_config',
    description: 'Platform configuration',
  },
  { module: 'system', name: 'system_log', description: 'Platform logs' },
  {
    module: 'system',
    name: 'integration',
    description: 'System integrations',
  },
  {
    module: 'system',
    name: 'system_audit',
    description: 'System audit trail',
  },
  {
    module: 'system',
    name: 'system_role',
    description: 'RBAC role management',
  },
  {
    module: 'system',
    name: 'system_permission',
    description: 'RBAC permission management',
  },
  {
    module: 'system',
    name: 'system_resource',
    description: 'RBAC resource catalog management',
  },
  {
    module: 'system',
    name: 'system_realm',
    description: 'Realm management',
  },
  {
    module: 'system',
    name: 'system_notification',
    description: 'Notification management',
  },
];

export const RBAC_RESOURCE_MODULE_BY_NAME = new Map(
  RBAC_RESOURCE_CATALOG.map((entry) => [entry.name, entry.module] as const),
);

export const RBAC_PERMISSIONS = [...AllPermissionSlugs];

export const RBAC_ROLES: RbacRoleManifestEntry[] = [
  {
    name: 'superadmin',
    displayName: 'Super Administrator',
    description: 'Full system access',
    dataScope: 'GLOBAL',
    isSystem: true,
    permissions: [],
  },
  {
    name: 'hr',
    displayName: 'Human Resources',
    description: 'HR parent role',
    dataScope: 'GLOBAL',
    isSystem: true,
    permissions: [],
  },
  {
    name: 'hr_manager',
    displayName: 'HR Manager',
    description: 'HR manager role',
    dataScope: 'GLOBAL',
    isSystem: true,
    parentRoleName: 'hr',
    permissions: [
      UserPermissions.VIEW,
      UserPermissions.CREATE,
      UserPermissions.UPDATE,
      UserPermissions.DISABLE,
      EmployeePermissions.ALL,
      LeavePermissions.ALL,
      HrPayrollPermissions.VIEW,
      HrPayrollPermissions.PROCESS,
    ],
  },
  {
    name: 'hr_assistant',
    displayName: 'HR Assistant',
    description: 'HR assistant role',
    dataScope: 'SELF',
    isSystem: true,
    parentRoleName: 'hr',
    permissions: [
      UserPermissions.VIEW,
      EmployeePermissions.VIEW,
      EmployeePermissions.CREATE,
      LeavePermissions.VIEW,
      LeavePermissions.CREATE,
    ],
  },
  {
    name: 'finance',
    displayName: 'Finance',
    description: 'Finance parent role',
    dataScope: 'GLOBAL',
    isSystem: true,
    permissions: [],
  },
  {
    name: 'finance_manager',
    displayName: 'Finance Manager',
    description: 'Finance manager role',
    dataScope: 'GLOBAL',
    isSystem: true,
    parentRoleName: 'finance',
    permissions: [
      InvoicePermissions.ALL,
      ExpensePermissions.ALL,
      FinanceReportPermissions.ALL,
      HrPayrollPermissions.APPROVE,
    ],
  },
  {
    name: 'finance_accountant',
    displayName: 'Finance Accountant',
    description: 'Finance accountant role',
    dataScope: 'SELF',
    isSystem: true,
    parentRoleName: 'finance',
    permissions: [
      InvoicePermissions.VIEW,
      InvoicePermissions.CREATE,
      ExpensePermissions.VIEW,
      ExpensePermissions.CREATE,
      FinanceReportPermissions.VIEW,
    ],
  },
  {
    name: 'project_manager',
    displayName: 'Project Management',
    description: 'Project management parent role',
    dataScope: 'GLOBAL',
    isSystem: true,
    permissions: [],
  },
  {
    name: 'pm_lead',
    displayName: 'PM Lead',
    description: 'Project lead role',
    dataScope: 'GLOBAL',
    isSystem: true,
    parentRoleName: 'project_manager',
    permissions: [ProjectPermissions.ALL, TaskPermissions.ALL],
  },
  {
    name: 'pm_member',
    displayName: 'PM Member',
    description: 'Project member role',
    dataScope: 'SELF',
    isSystem: true,
    parentRoleName: 'project_manager',
    permissions: [
      ProjectPermissions.VIEW,
      TaskPermissions.VIEW,
      TaskPermissions.CREATE,
      TaskPermissions.UPDATE,
      TaskPermissions.ASSIGN,
    ],
  },
  {
    name: 'crm_manager',
    displayName: 'CRM Management',
    description: 'CRM parent role',
    dataScope: 'GLOBAL',
    isSystem: true,
    permissions: [],
  },
  {
    name: 'crm_lead',
    displayName: 'CRM Lead',
    description: 'CRM lead role',
    dataScope: 'GLOBAL',
    isSystem: true,
    parentRoleName: 'crm_manager',
    permissions: [
      CrmClientPermissions.ALL,
      DealPermissions.ALL,
      PipelinePermissions.MANAGE,
    ],
  },
  {
    name: 'crm_agent',
    displayName: 'CRM Agent',
    description: 'CRM agent role',
    dataScope: 'SELF',
    isSystem: true,
    parentRoleName: 'crm_manager',
    permissions: [
      CrmClientPermissions.VIEW,
      CrmClientPermissions.CREATE,
      CrmClientPermissions.UPDATE,
      DealPermissions.VIEW,
      DealPermissions.CREATE,
      DealPermissions.UPDATE,
      PipelinePermissions.VIEW,
    ],
  },
  {
    name: 'brain_operator',
    displayName: 'Brain Operator',
    description: 'Brain parent role',
    dataScope: 'GLOBAL',
    isSystem: true,
    permissions: [],
  },
  {
    name: 'brain_admin',
    displayName: 'Brain Admin',
    description: 'Brain admin role',
    dataScope: 'GLOBAL',
    isSystem: true,
    parentRoleName: 'brain_operator',
    permissions: [BrainConfigPermissions.ALL, SystemLogPermissions.VIEW],
  },
  {
    name: 'brain_viewer',
    displayName: 'Brain Viewer',
    description: 'Brain viewer role',
    dataScope: 'SELF',
    isSystem: true,
    parentRoleName: 'brain_operator',
    permissions: [BrainConfigPermissions.VIEW, SystemLogPermissions.VIEW],
  },
];

export const RBAC_ROLE_NAMES = RBAC_ROLES.map((role) => role.name);

export const RBAC_ROLE_BY_NAME = new Map(
  RBAC_ROLES.map((role) => [role.name, role] as const),
);
