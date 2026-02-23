export type DataScopeLevel = 'global' | 'self';

/**
 * Canonical role scope map used by DataScopeService.resolveScope.
 * Only global and self scopes are supported.
 */
export const DATA_SCOPE_ROLE_LEVELS: Record<string, DataScopeLevel> = {
  superadmin: 'global',
  hr: 'global',
  hr_manager: 'global',
  hr_assistant: 'self',
  finance: 'global',
  finance_manager: 'global',
  finance_accountant: 'self',
  project_manager: 'global',
  pm_lead: 'global',
  pm_member: 'self',
  crm_manager: 'global',
  crm_lead: 'global',
  crm_agent: 'self',
  brain_operator: 'global',
  brain_admin: 'global',
  brain_viewer: 'self',
};
