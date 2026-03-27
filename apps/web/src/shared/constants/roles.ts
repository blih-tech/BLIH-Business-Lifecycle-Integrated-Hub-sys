export const ROLES = {
  SUPERADMIN: "superadmin",
  HR: "hr",
  FINANCE: "finance",
  PROJECT_MANAGER: "project_manager",
  CRM_MANAGER: "crm_manager",
  BRAIN_OPERATOR: "brain_operator",
  HR_MANAGER: "hr_manager",
  HR_ASSISTANT: "hr_assistant",
  FINANCE_MANAGER: "finance_manager",
  FINANCE_ACCOUNTANT: "finance_accountant",
  PM_LEAD: "pm_lead",
  PM_MEMBER: "pm_member",
  CRM_LEAD: "crm_lead",
  CRM_AGENT: "crm_agent",
  BRAIN_ADMIN: "brain_admin",
  BRAIN_VIEWER: "brain_viewer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_PRIORITY: Role[] = [
  ROLES.SUPERADMIN,
  ROLES.HR,
  ROLES.FINANCE,
  ROLES.PROJECT_MANAGER,
  ROLES.CRM_MANAGER,
  ROLES.BRAIN_OPERATOR,
];
