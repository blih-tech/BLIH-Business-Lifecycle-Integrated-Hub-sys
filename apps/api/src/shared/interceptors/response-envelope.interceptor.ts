import {
  CallHandler,
  ExecutionContext,
  InternalServerErrorException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, map } from 'rxjs';
import { getOrCreateRequestId } from '../utils/request.util';
import {
  ApiResponse,
  buildSuccessEnvelope,
  DEFAULT_SUCCESS_MESSAGE,
  PaginatedResult,
} from '../dto/response-envelope.dto';

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  if (value === null || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  if (typeof obj.success !== 'boolean') return false;
  if (typeof obj.message !== 'string') return false;
  if (!('data' in obj) || !('error' in obj) || !('meta' in obj)) return false;
  const meta = obj.meta;
  if (!meta || typeof meta !== 'object') return false;
  const metaObj = meta as Record<string, unknown>;
  return (
    typeof metaObj.timestamp === 'string' &&
    typeof metaObj.requestId === 'string' &&
    typeof metaObj.version === 'string'
  );
}

function hasPaginationShape(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.page === 'number' &&
    typeof obj.limit === 'number' &&
    typeof obj.total === 'number' &&
    typeof obj.totalPages === 'number'
  );
}

function isPaginatedResult(value: unknown): value is PaginatedResult<unknown> {
  if (value === null || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  if (!Array.isArray(o.items)) return false;
  const pagination = o.pagination as Record<string, unknown> | undefined;
  if (!hasPaginationShape(pagination)) return false;
  return (
    typeof pagination?.hasNextPage === 'boolean' &&
    typeof pagination?.hasPreviousPage === 'boolean'
  );
}

function isLegacyPaginatedResult(value: unknown): boolean {
  if (value === null || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  if (!Array.isArray(o.data)) return false;
  const meta = o.meta as Record<string, unknown> | undefined;
  const pagination = o.pagination as Record<string, unknown> | undefined;
  return hasPaginationShape(meta) || hasPaginationShape(pagination);
}

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = getOrCreateRequestId(request);

    return next.handle().pipe(
      map((data: unknown) => {
        if (isApiResponse(data)) {
          return data;
        }

        if (isPaginatedResult(data)) {
          return buildSuccessEnvelope(
            data.items,
            requestId,
            DEFAULT_SUCCESS_MESSAGE,
            {
              page: data.pagination.page,
              limit: data.pagination.limit,
              total: data.pagination.total,
              totalPages: data.pagination.totalPages,
              hasNextPage: data.pagination.hasNextPage,
              hasPreviousPage: data.pagination.hasPreviousPage,
            },
          );
        }

        if (isLegacyPaginatedResult(data)) {
          throw new InternalServerErrorException(
            'Legacy paginated response shape is unsupported. Return { items, pagination }.',
          );
        }

        return buildSuccessEnvelope(
          data ?? null,
          requestId,
          DEFAULT_SUCCESS_MESSAGE,
        );
      }),
    );
  }
}
