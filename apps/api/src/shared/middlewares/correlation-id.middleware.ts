import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { getOrCreateRequestId, REQUEST_ID_HEADER } from '../utils/request.util';

const normalizeLogPayload = (value: unknown): unknown => {
  if (value === undefined) {
    return null;
  }

  if (Buffer.isBuffer(value)) {
    return {
      type: 'Buffer',
      length: value.length,
    };
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
    };
  }

  if (
    value &&
    typeof value === 'object' &&
    'pipe' in value &&
    typeof value.pipe === 'function'
  ) {
    return '[Stream]';
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return value;
    }
  }

  return value;
};

const safeStringify = (value: unknown): string => {
  const seen = new WeakSet<object>();

  return JSON.stringify(
    value,
    (_key, currentValue: unknown) => {
      if (Buffer.isBuffer(currentValue)) {
        return {
          type: 'Buffer',
          length: currentValue.length,
        };
      }

      if (
        currentValue &&
        typeof currentValue === 'object' &&
        'pipe' in currentValue &&
        typeof currentValue.pipe === 'function'
      ) {
        return '[Stream]';
      }

      if (currentValue && typeof currentValue === 'object') {
        if (seen.has(currentValue)) {
          return '[Circular]';
        }

        seen.add(currentValue);
      }

      return currentValue;
    },
    2,
  );
};

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = getOrCreateRequestId(req);
    const startedAt = Date.now();
    let responseBody: unknown;

    req.headers[REQUEST_ID_HEADER] = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);

    const originalJson = res.json.bind(res);
    res.json = ((body: unknown) => {
      responseBody = body;
      return originalJson(body);
    }) as Response['json'];

    const originalSend = res.send.bind(res);
    res.send = ((body: unknown) => {
      if (responseBody === undefined) {
        responseBody = body;
      }

      return originalSend(body);
    }) as Response['send'];

    const originalRedirect = res.redirect.bind(res);
    res.redirect = ((statusOrUrl: number | string, url?: string) => {
      responseBody = {
        redirectTo: typeof statusOrUrl === 'number' ? url : statusOrUrl,
      };

      if (typeof statusOrUrl === 'number') {
        return originalRedirect(statusOrUrl, url ?? '');
      }

      return originalRedirect(statusOrUrl);
    }) as Response['redirect'];

    // Log incoming request before guards run (middleware runs before guards)
    const requestLog: Record<string, unknown> = {
      requestType: 'INCOMING',
      requestId,
      method: req.method,
      url: req.originalUrl ?? req.url,
      path: req.path,
      query: req.query,
      headers: req.headers,
      body: normalizeLogPayload(req.body),
    };
    console.log('==============================================');
    console.log('==============================================');
    console.log(
      '[CorrelationIdMiddleware] INCOMING REQUEST',
      safeStringify(requestLog),
    );
    console.log('==============================================');
    console.log('==============================================');

    res.on('finish', () => {
      const responseLog: Record<string, unknown> = {
        requestType: 'OUTGOING',
        requestId,
        method: req.method,
        url: req.originalUrl ?? req.url,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        durationMs: Date.now() - startedAt,
        headers: res.getHeaders(),
        body: normalizeLogPayload(responseBody),
      };

      console.log('==============================================');
      console.log('==============================================');
      console.log(
        '[CorrelationIdMiddleware] OUTGOING RESPONSE',
        safeStringify(responseLog),
      );
      console.log('==============================================');
      console.log('==============================================');
    });

    next();
  }
}
