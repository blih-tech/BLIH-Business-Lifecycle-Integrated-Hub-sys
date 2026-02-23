import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';
export interface AuditMetadata {
  action: string;
  resource: string;
}

export const Audit = (
  action: string,
  resource: string,
): MethodDecorator & ClassDecorator =>
  SetMetadata(AUDIT_KEY, { action, resource } satisfies AuditMetadata);
