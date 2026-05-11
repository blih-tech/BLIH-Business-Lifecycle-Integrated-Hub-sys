/**
 * Deprecated: hardcoded role-permission baselines are intentionally removed.
 *
 * Production RBAC permissions must come from the database only:
 * - RolePermission + Permission tables
 * - User.permissions additive assignments
 *
 * Keeping this module as an explicit "no fallback" marker prevents accidental
 * reintroduction of mock/dummy permission expansion logic.
 */
export const ROLE_PERMISSION_BASELINE: Readonly<
  Record<string, readonly string[]>
> = Object.freeze({});

export function buildBaselinePermissions(lowerRoleNames: string[]): string[] {
  void lowerRoleNames;
  return [];
}
