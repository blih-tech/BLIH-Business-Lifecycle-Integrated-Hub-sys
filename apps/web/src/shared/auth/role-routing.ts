export type DashboardArea =
  | 'brain'
  | 'crm'
  | 'finance'
  | 'hr'
  | 'pm'
  | 'superadmin';

const AREA_ROLE_TOKENS: Record<DashboardArea, string[]> = {
  brain: ['brain'],
  crm: ['crm'],
  finance: ['finance'],
  hr: ['hr'],
  pm: ['pm', 'project'],
  superadmin: ['superadmin', 'admin'],
};

function normalizeRole(role: string): string {
  return role.toLowerCase().trim();
}

export function isAuthorizedForDashboard(
  area: DashboardArea,
  roles: string[],
): boolean {
  const normalizedRoles = roles.map(normalizeRole);
  const allowedTokens = AREA_ROLE_TOKENS[area];

  if (normalizedRoles.some((role) => role.includes('superadmin'))) {
    return true;
  }

  return normalizedRoles.some((role) =>
    allowedTokens.some((token) => role.includes(token)),
  );
}
