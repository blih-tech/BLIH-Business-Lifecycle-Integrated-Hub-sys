export const NOTIFICATION_TYPES = {
  SECURITY: 'security',
  SYSTEM: 'system',
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
} as const;

export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  WEBHOOK: 'webhook',
  IN_APP: 'in_app',
} as const;
