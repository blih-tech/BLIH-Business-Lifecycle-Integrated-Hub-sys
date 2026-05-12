/**
 * Canonical values live in `packages/types/src/rbac/permissions.constants.ts`.
 * Duplicated here so the web app does not require a workspace install of `@repo/types`
 * for local development on all platforms.
 */
export const JobPermissions = {
  VIEW: 'job:view',
  CREATE: 'job:create',
  UPDATE: 'job:update',
} as const;

export const JobApprovalPermissions = {
  DECIDE: 'job_approval:decide',
} as const;
