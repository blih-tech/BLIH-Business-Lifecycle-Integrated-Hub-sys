import { AllPermissionSlugs } from '../../../core/rbac/constants/permissions.constants';

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

export const RBAC_PERMISSIONS = [...AllPermissionSlugs];

const resourceNames = [
  ...new Set(
    RBAC_PERMISSIONS.map((slug) => slug.split(':')[0]).filter(Boolean),
  ),
];

export const RBAC_RESOURCE_CATALOG: RbacResourceCatalogEntry[] =
  resourceNames.map((name) => ({
    name,
    description: `${name.replace(/_/g, ' ')} permissions`,
  }));

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
