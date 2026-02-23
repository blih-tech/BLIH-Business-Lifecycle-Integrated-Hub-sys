import { registerAs } from '@nestjs/config';
import { env } from './env.config';

export interface AuditConfig {
  retentionDays: number;
}

export default registerAs(
  'audit',
  (): AuditConfig => ({
    retentionDays: env.AUDIT_RETENTION_DAYS,
  }),
);
