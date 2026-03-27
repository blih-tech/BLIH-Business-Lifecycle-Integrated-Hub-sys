import { ROLES, type Role } from "@/shared/constants/roles";

export const DASHBOARD_KEYS = ["superadmin", "hr", "finance", "pm", "crm", "brain"] as const;
export type DashboardKey = (typeof DASHBOARD_KEYS)[number];

const DASHBOARD_ROLE_MATCHERS: Record<DashboardKey, Role[]> = {
  superadmin: [ROLES.SUPERADMIN],
  hr: [ROLES.HR, ROLES.HR_MANAGER, ROLES.HR_ASSISTANT],
  finance: [ROLES.FINANCE, ROLES.FINANCE_MANAGER, ROLES.FINANCE_ACCOUNTANT],
  pm: [ROLES.PROJECT_MANAGER, ROLES.PM_LEAD, ROLES.PM_MEMBER],
  crm: [ROLES.CRM_MANAGER, ROLES.CRM_LEAD, ROLES.CRM_AGENT],
  brain: [ROLES.BRAIN_OPERATOR, ROLES.BRAIN_ADMIN, ROLES.BRAIN_VIEWER],
};

const DASHBOARD_PRIORITY: DashboardKey[] = [
  "superadmin",
  "hr",
  "finance",
  "pm",
  "crm",
  "brain",
];

export function getDashboardKey(roles: Role[]): DashboardKey | null {
  const roleSet = new Set<Role>(roles);
  for (const key of DASHBOARD_PRIORITY) {
    const matchers = DASHBOARD_ROLE_MATCHERS[key];
    if (matchers.some((role) => roleSet.has(role))) {
      return key;
    }
  }
  return null;
}

export function getDashboardPath(roles: Role[]): string | null {
  const key = getDashboardKey(roles);
  return key ? `/dashboard/${key}` : null;
}

export function isAuthorizedForDashboard(key: DashboardKey, roles: Role[]): boolean {
  const roleSet = new Set<Role>(roles);
  return DASHBOARD_ROLE_MATCHERS[key].some((role) => roleSet.has(role));
}
