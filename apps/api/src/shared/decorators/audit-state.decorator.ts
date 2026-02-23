import { SetMetadata } from '@nestjs/common';

export const AUDIT_STATE_KEY = 'auditState';
export type AuditEntityType =
  | 'user'
  | 'realm'
  | 'department'
  | 'organization'
  | 'role';
export interface AuditStateMetadata {
  /** Where to read resource id from, e.g. 'params.id' or 'params.userId' */
  resourceIdKey?: string;
  /** If true, load and capture entity state before the handler runs (pre-audit) */
  loadBefore?: boolean;
  /** Entity type for loading; if omitted, derived from Audit resource string */
  entity?: AuditEntityType;
}

export const AuditState = (
  options: AuditStateMetadata = {},
): MethodDecorator & ClassDecorator =>
  SetMetadata(AUDIT_STATE_KEY, options satisfies AuditStateMetadata);
