import type { WebSession } from './session';
import { isAuthorizedForDashboard, type DashboardArea } from './role-routing';

/** Aligns with API `/auth/me` permission strings (see `packages/types/src/rbac/permissions.constants.ts`). */
const PERMS = {
  employeeView: 'employee:view',
  financeReportView: 'finance_report:view',
  crmClientView: 'crm_client:view',
  brainConfigView: 'brain_config:view',
  projectView: 'project:view',
  systemRoleView: 'system_role:view',
} as const;

export type DashboardNavItem = {
  href: string;
  label: string;
  area: DashboardArea | 'home';
};

function hasPermission(session: WebSession, required: string): boolean {
  const perms = session.permissions;
  if (perms.includes(required)) return true;
  const prefix = required.split(':')[0];
  if (prefix && perms.includes(`${prefix}:*`)) return true;
  return false;
}

function canAccessHr(session: WebSession): boolean {
  return (
    isAuthorizedForDashboard('hr', session.roles) ||
    hasPermission(session, PERMS.employeeView)
  );
}

function canAccessFinance(session: WebSession): boolean {
  return (
    isAuthorizedForDashboard('finance', session.roles) ||
    hasPermission(session, PERMS.financeReportView)
  );
}

function canAccessCrm(session: WebSession): boolean {
  return (
    isAuthorizedForDashboard('crm', session.roles) ||
    hasPermission(session, PERMS.crmClientView)
  );
}

function canAccessBrain(session: WebSession): boolean {
  return (
    isAuthorizedForDashboard('brain', session.roles) ||
    hasPermission(session, PERMS.brainConfigView)
  );
}

function canAccessPm(session: WebSession): boolean {
  return (
    isAuthorizedForDashboard('pm', session.roles) ||
    hasPermission(session, PERMS.projectView)
  );
}

function canAccessSuperadmin(session: WebSession): boolean {
  return (
    isAuthorizedForDashboard('superadmin', session.roles) ||
    hasPermission(session, PERMS.systemRoleView)
  );
}

export function getDashboardNavItems(session: WebSession): DashboardNavItem[] {
  const items: DashboardNavItem[] = [
    { href: '/', label: 'Overview', area: 'home' },
  ];

  if (canAccessSuperadmin(session)) {
    items.push({
      href: '/superadmin',
      label: 'Superadmin',
      area: 'superadmin',
    });
  }
  if (canAccessHr(session)) {
    items.push({ href: '/hr', label: 'HR', area: 'hr' });
  }
  if (canAccessFinance(session)) {
    items.push({ href: '/finance', label: 'Finance', area: 'finance' });
  }
  if (canAccessCrm(session)) {
    items.push({ href: '/crm', label: 'CRM', area: 'crm' });
  }
  if (canAccessBrain(session)) {
    items.push({ href: '/brain', label: 'Brain', area: 'brain' });
  }
  if (canAccessPm(session)) {
    items.push({ href: '/pm', label: 'Projects', area: 'pm' });
  }

  return items;
}

export function getDefaultDashboardPath(session: WebSession): string {
  const nav = getDashboardNavItems(session);
  const first = nav.find((i) => i.area !== 'home');
  return first?.href ?? '/no-access?error=unauthorized';
}

function segmentAfterDashboard(pathname: string): string | undefined {
  const normalized = pathname.split('?')[0]?.replace(/\/+$/, '') ?? '';
  if (normalized === '' || normalized === '/') return undefined;
  const seg = normalized.replace(/^\//, '').split('/')[0];
  return seg || undefined;
}

export function getAccessDeniedRedirect(
  pathname: string,
  session: WebSession,
): string | null {
  const seg = segmentAfterDashboard(pathname);
  if (!seg) return null;

  const checks: [string, (s: WebSession) => boolean][] = [
    ['hr', canAccessHr],
    ['finance', canAccessFinance],
    ['crm', canAccessCrm],
    ['brain', canAccessBrain],
    ['pm', canAccessPm],
    ['superadmin', canAccessSuperadmin],
  ];

  for (const [key, fn] of checks) {
    if (seg === key && !fn(session)) {
      return '/no-access?error=unauthorized';
    }
  }

  return null;
}
