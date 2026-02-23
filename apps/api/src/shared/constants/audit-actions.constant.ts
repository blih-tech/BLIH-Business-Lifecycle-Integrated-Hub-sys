export const AUDIT_ACTIONS = {
  AUTH_LOGIN_SUCCESS: 'auth.login.success',
  AUTH_LOGIN_FAILURE: 'auth.login.failure',
  AUTH_LOGOUT: 'auth.logout',
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DISABLED: 'user.disabled',
  ROLE_ASSIGNED: 'role.assigned',
  ROLE_REVOKED: 'role.revoked',
  CONFIG_UPDATED: 'system.config.updated',
} as const;
