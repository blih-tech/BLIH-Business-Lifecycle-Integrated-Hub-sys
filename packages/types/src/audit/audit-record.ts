export type AuditResultStatus = 'SUCCESS' | 'FAILURE';

export interface AuditRecordDto {
  action: string;
  module: string;
  resource: string;
  resourceId?: string;
  actorUserId?: string;
  actorEmail?: string;
  requestId: string;
  correlationId: string;
  ipAddress: string;
  userAgent: string;
  result?: AuditResultStatus;
  statusCode?: number;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
