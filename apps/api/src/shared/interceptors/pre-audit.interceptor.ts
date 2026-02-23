import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from, switchMap } from 'rxjs';
import { AUDIT_KEY, AuditMetadata } from '../decorators/audit.decorator';
import {
  AUDIT_STATE_KEY,
  AuditStateMetadata,
} from '../decorators/audit-state.decorator';
import { AuditStateService } from '../../core/audit/audit-state.service';

/** Attached to request by PreAuditInterceptor for use by AuditInterceptor */
export const AUDIT_BEFORE_STATE = 'auditBeforeState';
export const AUDIT_RESOURCE_ID = 'auditResourceId';

interface RequestWithAudit {
  params?: Record<string, unknown>;
  body?: Record<string, unknown>;
  [AUDIT_BEFORE_STATE]?: Record<string, unknown>;
  [AUDIT_RESOURCE_ID]?: string;
}

@Injectable()
export class PreAuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditStateService: AuditStateService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const auditMetadata = this.reflector.getAllAndOverride<
      AuditMetadata | undefined
    >(AUDIT_KEY, [context.getHandler(), context.getClass()]);
    const stateMetadata = this.reflector.getAllAndOverride<
      AuditStateMetadata | undefined
    >(AUDIT_STATE_KEY, [context.getHandler(), context.getClass()]);

    if (
      !auditMetadata ||
      !stateMetadata?.loadBefore ||
      !stateMetadata.resourceIdKey
    ) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<RequestWithAudit>();
    const id = this.getResourceId(request, stateMetadata.resourceIdKey);
    if (!id || typeof id !== 'string') {
      return next.handle();
    }

    return from(
      this.auditStateService.loadBeforeState(
        auditMetadata.resource,
        id,
        undefined,
        stateMetadata.entity,
      ),
    ).pipe(
      switchMap((beforeState) => {
        request[AUDIT_BEFORE_STATE] = beforeState ?? undefined;
        request[AUDIT_RESOURCE_ID] = id;
        return next.handle();
      }),
    );
  }

  private getResourceId(
    request: RequestWithAudit,
    resourceIdKey: string,
  ): string | undefined {
    const parts = resourceIdKey.split('.');
    let current: unknown = request;
    for (const part of parts) {
      if (current == null || typeof current !== 'object') {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }
    return typeof current === 'string' ? current : undefined;
  }
}
