import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { getOrCreateRequestId, REQUEST_ID_HEADER } from '../utils/request.util';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = getOrCreateRequestId(req);
    req.headers[REQUEST_ID_HEADER] = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);

    // Log incoming request before guards run (middleware runs before guards)
    const requestLog: Record<string, unknown> = {
      requestType: 'INCOMING',
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      headers: req.headers,
      body: req.body,
    };
    console.log('==============================================');
    console.log('==============================================');
    console.log(
      '[CorrelationIdMiddleware] INCOMING REQUEST',
      JSON.stringify(requestLog, null, 2),
    );
    console.log('==============================================');
    console.log('==============================================');

    next();
  }
}
