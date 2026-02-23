export const SYSTEM_ROLES = {
  SUPERADMIN: 'superadmin',
  HR: 'hr',
  HR_MANAGER: 'hr_manager',
  HR_ASSISTANT: 'hr_assistant',
  FINANCE: 'finance',
  FINANCE_MANAGER: 'finance_manager',
  FINANCE_ACCOUNTANT: 'finance_accountant',
  PROJECT_MANAGER: 'project_manager',
  PM_LEAD: 'pm_lead',
  PM_MEMBER: 'pm_member',
  CRM_MANAGER: 'crm_manager',
  CRM_LEAD: 'crm_lead',
  CRM_AGENT: 'crm_agent',
  BRAIN_OPERATOR: 'brain_operator',
  BRAIN_ADMIN: 'brain_admin',
  BRAIN_VIEWER: 'brain_viewer',
} as const;

export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];
