import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import type { Prisma } from '../../platform/prisma/prisma-client';
import { AUDIT_KEY, AuditMetadata } from '../decorators/audit.decorator';
import { AUDIT_BEFORE_STATE, AUDIT_RESOURCE_ID } from './pre-audit.interceptor';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { buildRequestContext } from '../utils/request.util';

interface RequestWithUser {
  headers: Record<string, string | string[] | undefined>;
  method: string;
  url: string;
  user?: { sub?: string; email?: string; realm?: string };
  body?: unknown;
  params?: unknown;
  query?: unknown;
  ip: string;
  [AUDIT_BEFORE_STATE]?: Record<string, unknown>;
  [AUDIT_RESOURCE_ID]?: string;
}

interface ResponseWithStatusCode {
  statusCode?: number;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metadata = this.reflector.getAllAndOverride<
      AuditMetadata | undefined
    >(AUDIT_KEY, [context.getHandler(), context.getClass()]);

    if (!metadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const response = context
      .switchToHttp()
      .getResponse<ResponseWithStatusCode>();

    return next.handle().pipe(
      tap({
        next: (responseData: unknown) => {
          void this.persistAudit(request, metadata, {
            result: 'SUCCESS',
            statusCode: response.statusCode,
            responseData,
          });
        },
      }),
      catchError((error: unknown) => {
        const statusCode =
          error instanceof HttpException
            ? error.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        void this.persistAudit(request, metadata, {
          result: 'FAILURE',
          statusCode,
          error,
        });

        return throwError(() => error);
      }),
    );
  }

  private async persistAudit(
    request: RequestWithUser,
    metadata: AuditMetadata,
    outcome: {
      result: 'SUCCESS' | 'FAILURE';
      statusCode?: number;
      error?: unknown;
      responseData?: unknown;
    },
  ): Promise<void> {
    const context = buildRequestContext(request as never);

    const metadataPayload: Record<string, unknown> = {
      method: request.method,
      url: request.url,
      params: request.params,
      query: request.query,
    };
    if (outcome.error !== undefined) {
      metadataPayload.error =
        outcome.error instanceof Error ? outcome.error.message : outcome.error;
    }

    const before =
      request[AUDIT_BEFORE_STATE] != null
        ? (request[AUDIT_BEFORE_STATE] as Prisma.InputJsonValue)
        : undefined;
    const after = this.normalizeAfterState(outcome.responseData, request.body);

    await this.prisma.auditLog.create({
      data: {
        action: metadata.action,
        module: metadata.resource.split('.')[0] ?? 'core',
        resource: metadata.resource,
        resourceId: request[AUDIT_RESOURCE_ID] ?? undefined,
        actorUserId: request.user?.sub,
        actorEmail: request.user?.email,
        requestId: context.requestId,
        correlationId: context.requestId,
        sessionId: undefined,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        result: outcome.result,
        statusCode: outcome.statusCode,
        metadata: metadataPayload as Prisma.InputJsonValue,
        before,
        after,
      },
    });
  }

  private normalizeAfterState(
    responseData: unknown,
    body: unknown,
  ): Prisma.InputJsonValue | undefined {
    if (responseData != null && typeof responseData === 'object') {
      return responseData as Prisma.InputJsonValue;
    }
    if (body != null && typeof body === 'object') {
      return body as Prisma.InputJsonValue;
    }
    return undefined;
  }
}
