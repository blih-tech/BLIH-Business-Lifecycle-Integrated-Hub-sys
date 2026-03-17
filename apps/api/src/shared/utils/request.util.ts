import { randomUUID } from 'crypto';
import { Request } from 'express';

export const REQUEST_ID_HEADER = 'x-correlation-id';

export interface RequestContext {
  requestId: string;
  ipAddress: string;
  userAgent: string;
}

const readHeaderValue = (
  value: string | string[] | undefined,
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const resolveForwardedIp = (request: Request): string | undefined => {
  const forwardedFor = readHeaderValue(request.headers['x-forwarded-for']);
  if (forwardedFor) {
    const firstHop = forwardedFor.split(',')[0]?.trim();
    if (firstHop) {
      return firstHop;
    }
  }

  return readHeaderValue(request.headers['x-real-ip']);
};

export const getOrCreateRequestId = (request: Request): string => {
  const raw =
    request.headers[REQUEST_ID_HEADER] ?? request.headers['x-request-id'];
  const requestId = Array.isArray(raw) ? raw[0] : raw;
  return requestId ?? randomUUID();
};

export const buildRequestContext = (request: Request): RequestContext => ({
  requestId: getOrCreateRequestId(request),
  ipAddress: resolveForwardedIp(request) ?? request.ip ?? 'unknown',
  userAgent: request.headers['user-agent'] ?? 'unknown',
});
