import { randomUUID } from 'crypto';
import { Request } from 'express';

export const REQUEST_ID_HEADER = 'x-correlation-id';

export interface RequestContext {
  requestId: string;
  ipAddress: string;
  userAgent: string;
}

export const getOrCreateRequestId = (request: Request): string => {
  const raw =
    request.headers[REQUEST_ID_HEADER] ?? request.headers['x-request-id'];
  const requestId = Array.isArray(raw) ? raw[0] : raw;
  return requestId ?? randomUUID();
};

export const buildRequestContext = (request: Request): RequestContext => ({
  requestId: getOrCreateRequestId(request),
  ipAddress: request.ip ?? 'unknown',
  userAgent: request.headers['user-agent'] ?? 'unknown',
});
