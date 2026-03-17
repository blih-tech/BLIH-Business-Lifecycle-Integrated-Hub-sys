import type { AuditResultStatus } from './audit-record.js';

export interface AuditQueryDto {
  action?: string;
  module?: string;
  actorUserId?: string;
  result?: AuditResultStatus;
  statusCode?: number;
  from?: string;
  to?: string;
}
