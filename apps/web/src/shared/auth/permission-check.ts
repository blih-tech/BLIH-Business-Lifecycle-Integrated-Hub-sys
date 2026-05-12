/**
 * Keep in sync with API `hasWildcardPermission` in
 * `apps/api/src/platform/keycloak/utils/role.util.ts`.
 */
export const normalizePermission = (permission: string): string =>
  permission.trim().toLowerCase();

export const hasWildcardPermission = (
  permissions: string[],
  requested: string,
): boolean => {
  const normalizedRequested = normalizePermission(requested);
  const requestedParts = normalizedRequested.split(':');
  if (requestedParts.length !== 2) {
    return false;
  }

  return permissions.some((entry) => {
    const normalized = normalizePermission(entry);
    if (normalized === '*' || normalized === normalizedRequested) {
      return true;
    }

    const candidateParts = normalized.split(':');
    if (candidateParts.length !== 2) {
      return false;
    }

    return candidateParts[0] === requestedParts[0] && candidateParts[1] === '*';
  });
};

/** Mirrors `RbacGuard` superadmin short-circuit (lowercased role tokens). */
export function isSuperAdmin(roles: string[]): boolean {
  return roles.some((role) => role.toLowerCase().trim() === 'superadmin');
}

export function userHasPermission(
  permissions: string[],
  roles: string[],
  required: string,
): boolean {
  if (isSuperAdmin(roles)) return true;
  return hasWildcardPermission(permissions, required);
}

export function userHasAnyPermission(
  permissions: string[],
  roles: string[],
  required: readonly string[],
): boolean {
  if (isSuperAdmin(roles)) return true;
  return required.some((slug) => hasWildcardPermission(permissions, slug));
}
